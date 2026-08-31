import { TalepColumns } from "../schema";
import { Talep } from "../types";

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

export function talepleriEsle(dataset: DataSet): Talep[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            metin: metin(record, TalepColumns.talepMetni, mevcut),
            urunTipi: metin(record, TalepColumns.urunTipi, mevcut),
            oncelik: metin(record, TalepColumns.oncelik, mevcut),
            calisan: metin(record, TalepColumns.calisan, mevcut),
            olusturulma: tarih(record, TalepColumns.olusturulma, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [TalepColumns.talepMetni, "Talep Metni"],
        [TalepColumns.urunTipi, "Ürün Tipi"],
        [TalepColumns.oncelik, "Öncelik"],
        [TalepColumns.calisan, "Çalışan"],
        [TalepColumns.olusturulma, "Oluşturulma Tarihi"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
