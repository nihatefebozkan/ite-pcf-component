import { OnayColumns } from "../schema";
import { Karar } from "../types";

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
 * PCF'te dataset lookup'ı `EntityReference` döndürüyor ve orada `id` düz string
 * değil `{ guid: string }` nesnesi. Web API tarafındaki `LookupValue` ise
 * `id: string` kullanıyor. Dizi hâlinde gelen çoklu lookup'lar da var.
 * Üç biçimi birden karşılıyoruz, aksi halde id sessizce null kalıyor.
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

/** Lookup'ın ham değerinden hedef kaydın id'sini çıkarır. */
function lookupId(record: EntityRecord, sutun: string, mevcut: Set<string>): string | null {
    if (!mevcut.has(sutun)) return null;
    return guidCikar(record.getValue(sutun));
}

export function kararlariEsle(dataset: DataSet): Karar[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];

        // Talep id'si iki yoldan gelebilir: lookup'ın okuma alanından
        // (_cr545_talep_value) ya da lookup'ın kendisinden. Görünümde hangisi
        // varsa o kullanılıyor.
        const talepId =
            lookupId(record, OnayColumns.talepValue, mevcut) ??
            lookupId(record, OnayColumns.talep, mevcut);

        return {
            id: record.getRecordId(),
            durumDegeri: sayi(record, OnayColumns.durum, mevcut),
            durumEtiketi: metin(record, OnayColumns.durum, mevcut),
            aciklama: metin(record, OnayColumns.aciklama, mevcut),
            talepId,
            talepAdi: metin(record, OnayColumns.talep, mevcut),
            kararTarihi: tarih(record, OnayColumns.kararTarihi, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [OnayColumns.durum, "Durum"],
        [OnayColumns.aciklama, "Açıklama"],
        [OnayColumns.kararTarihi, "Değiştirilme Tarihi"],
    ];

    const eksik = gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);

    // Talep ya lookup ya da okuma alanı olarak gelmeli; ikisi de yoksa eksik.
    if (!mevcut.has(OnayColumns.talep) && !mevcut.has(OnayColumns.talepValue)) {
        eksik.push("Talep");
    }
    return eksik;
}
