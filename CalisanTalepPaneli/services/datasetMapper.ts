import { Columns } from "../schema";
import { Talep } from "../types";

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type EntityRecord = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;

/**
 * Dataset kayıtlarını bileşenin çalıştığı biçime çevirir.
 *
 * Dataset yalnızca görünümün sütun listesindeki alanları taşır. Görünümde
 * olmayan bir sütun okunmaya çalışılırsa beklenmedik sonuç döner, bu yüzden
 * önce hangi sütunların geldiği tespit edilip yalnızca onlar okunuyor.
 */
function mevcutSutunlar(dataset: DataSet): Set<string> {
    return new Set(dataset.columns.map((c) => c.name));
}

function metin(record: EntityRecord, sutun: string, mevcut: Set<string>): string | null {
    if (!mevcut.has(sutun)) return null;
    const deger = record.getFormattedValue(sutun);
    if (typeof deger === "string" && deger.length > 0) return deger;

    const ham = record.getValue(sutun);
    return typeof ham === "string" && ham.length > 0 ? ham : null;
}

/** Choice sütunlarının ham seçenek değeri. */
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

export function talepleriEsle(dataset: DataSet): Talep[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            metin: metin(record, Columns.talepMetni, mevcut),
            urunTipi: metin(record, Columns.urunTipi, mevcut),
            oncelik: metin(record, Columns.oncelik, mevcut),
            durum: metin(record, Columns.durum, mevcut),
            durumDegeri: sayi(record, Columns.durum, mevcut),
            olusturulma: tarih(record, Columns.olusturulma, mevcut),
        };
    });
}

/** Görünümde eksik olan zorunlu sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [Columns.talepMetni, "Talep Metni"],
        [Columns.durum, "Durum"],
        [Columns.oncelik, "Öncelik"],
        [Columns.olusturulma, "Oluşturulma Tarihi"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
