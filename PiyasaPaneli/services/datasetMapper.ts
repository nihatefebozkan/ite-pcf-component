import { PiyasaColumns } from "../schema";
import { Bulgu } from "../types";

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

/** URL alanında biçimli değer kırpılmış gelebiliyor; ham değeri tercih et. */
function hamMetin(record: EntityRecord, sutun: string, mevcut: Set<string>): string | null {
    if (!mevcut.has(sutun)) return null;

    const ham = record.getValue(sutun);
    if (typeof ham === "string" && ham.length > 0) return ham;
    return metin(record, sutun, mevcut);
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

function temizle(guid: string): string | null {
    const sade = guid.replace(/[{}]/g, "").trim();
    return sade.length > 0 ? sade : null;
}

/**
 * Lookup değerinden GUID çıkarır. PCF dataset'inde lookup `EntityReference`
 * döner ve `id` düz string değil `{ guid: string }` nesnesidir.
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

export function bulgulariEsle(dataset: DataSet): Bulgu[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            kaynakSite: metin(record, PiyasaColumns.kaynakSite, mevcut),
            urunAdi: metin(record, PiyasaColumns.urunAdi, mevcut),
            fiyat: sayi(record, PiyasaColumns.bulunanFiyat, mevcut),
            link: hamMetin(record, PiyasaColumns.urunLinki, mevcut),
            not: metin(record, PiyasaColumns.karsilastirmaNotu, mevcut),
            talepId: mevcut.has(PiyasaColumns.talep)
                ? guidCikar(record.getValue(PiyasaColumns.talep))
                : null,
            talepAdi: metin(record, PiyasaColumns.talep, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [PiyasaColumns.talep, "Talep"],
        [PiyasaColumns.kaynakSite, "Kaynak Site"],
        [PiyasaColumns.bulunanFiyat, "Bulunan Fiyat"],
        [PiyasaColumns.urunLinki, "Ürün Linki"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
