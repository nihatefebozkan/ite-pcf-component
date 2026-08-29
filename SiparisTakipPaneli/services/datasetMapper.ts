import { SiparisColumns } from "../schema";
import { Siparis } from "../types";

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type EntityRecord = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;

function mevcutSutunlar(dataset: DataSet): Set<string> {
    return new Set(dataset.columns.map((c) => c.name));
}

function metin(record: EntityRecord, sutun: string, mevcut: Set<string>): string | null {
    if (!mevcut.has(sutun)) return null;

    const bicimli = record.getFormattedValue(sutun);
    if (typeof bicimli === "string" && bicimli.length > 0) return bicimli;

    const ham = record.getValue(sutun);
    return typeof ham === "string" && ham.length > 0 ? ham : null;
}

function sayi(record: EntityRecord, sutun: string, mevcut: Set<string>): number | null {
    if (!mevcut.has(sutun)) return null;

    const ham = record.getValue(sutun);
    if (typeof ham === "number" && isFinite(ham)) return ham;
    if (typeof ham === "string" && ham.trim() !== "") {
        const n = Number(ham);
        return isFinite(n) ? n : null;
    }
    return null;
}

function mantik(record: EntityRecord, sutun: string, mevcut: Set<string>): boolean {
    if (!mevcut.has(sutun)) return false;

    const ham = record.getValue(sutun);
    if (typeof ham === "boolean") return ham;
    if (typeof ham === "number") return ham !== 0;
    // Biçimli değer "Evet"/"Yes" olarak da gelebilir.
    const bicimli = record.getFormattedValue(sutun);
    return typeof bicimli === "string" && /^(evet|yes|true|1)$/i.test(bicimli.trim());
}

function tarih(record: EntityRecord, sutun: string, mevcut: Set<string>): Date | null {
    if (!mevcut.has(sutun)) return null;

    const ham = record.getValue(sutun);
    if (ham instanceof Date) return ham;
    if (typeof ham === "string" || typeof ham === "number") {
        const d = new Date(ham);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function temizle(guid: string): string | null {
    const sade = guid.replace(/[{}]/g, "").trim();
    return sade.length > 0 ? sade : null;
}

/**
 * Lookup değerinden GUID çıkarır.
 *
 * PCF dataset'inde lookup `EntityReference` döner ve `id` düz string değil
 * `{ guid: string }` nesnesidir. Web API tarafındaki `LookupValue` ise
 * `id: string` kullanır. İki biçimi de karşılıyoruz.
 */
function guidCikar(deger: unknown): string | null {
    if (typeof deger === "string") return temizle(deger);
    if (!deger || typeof deger !== "object") return null;

    if (Array.isArray(deger)) {
        return deger.length > 0 ? guidCikar(deger[0]) : null;
    }

    const nesne = deger as { id?: unknown; guid?: unknown };
    if (typeof nesne.guid === "string") return temizle(nesne.guid);
    if (typeof nesne.id === "string") return temizle(nesne.id);
    if (nesne.id && typeof nesne.id === "object") {
        const ic = nesne.id as { guid?: unknown };
        if (typeof ic.guid === "string") return temizle(ic.guid);
    }
    return null;
}

export function siparisleriEsle(dataset: DataSet): Siparis[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            siparisNo: metin(record, SiparisColumns.siparisNo, mevcut),
            talepId: mevcut.has(SiparisColumns.talep)
                ? guidCikar(record.getValue(SiparisColumns.talep))
                : null,
            tedarikci: metin(record, SiparisColumns.tedarikci, mevcut),
            tutar: sayi(record, SiparisColumns.tutar, mevcut),
            kontrolGerekli: mantik(record, SiparisColumns.kontrolGerekli, mevcut),
            agentNotu: metin(record, SiparisColumns.agentNotu, mevcut),
            sonEpostaTarihi: tarih(record, SiparisColumns.sonEpostaTarihi, mevcut),
            olusturulma: tarih(record, SiparisColumns.olusturulma, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [SiparisColumns.siparisNo, "Sipariş No"],
        [SiparisColumns.talep, "Talep"],
        [SiparisColumns.tedarikci, "Tedarikçi"],
        [SiparisColumns.tutar, "Tutar"],
        [SiparisColumns.kontrolGerekli, "Kontrol Gerekli"],
        [SiparisColumns.agentNotu, "Agent Notu"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
