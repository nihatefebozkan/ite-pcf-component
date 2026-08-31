import { TedarikciColumns } from "../schema";
import { Tedarikci } from "../types";

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

    const bicimli = record.getFormattedValue(sutun);
    return typeof bicimli === "string" && /^(evet|yes|true|1)$/i.test(bicimli.trim());
}

export function tedarikcileriEsle(dataset: DataSet): Tedarikci[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            ad: metin(record, TedarikciColumns.ad, mevcut) ?? "(adsız tedarikçi)",
            urunKategorisi: metin(record, TedarikciColumns.urunKategorisi, mevcut),
            email: metin(record, TedarikciColumns.email, mevcut),
            anlasmali: mantik(record, TedarikciColumns.anlasmali, mevcut),
            fiyat: sayi(record, TedarikciColumns.fiyat, mevcut),
            teslimSuresi: sayi(record, TedarikciColumns.teslimSuresi, mevcut),
            gecTeslimatOrani: sayi(record, TedarikciColumns.gecTeslimatOrani, mevcut),
            garantiSuresi: sayi(record, TedarikciColumns.garantiSuresi, mevcut),
            surdurulebilirlikPuani: sayi(record, TedarikciColumns.surdurulebilirlikPuani, mevcut),
            gecmisSiparisSayisi: sayi(record, TedarikciColumns.gecmisSiparisSayisi, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [TedarikciColumns.ad, "Ad"],
        [TedarikciColumns.email, "E-posta"],
        [TedarikciColumns.anlasmali, "Anlaşmalı Tedarikçi"],
        [TedarikciColumns.fiyat, "Fiyat"],
        [TedarikciColumns.teslimSuresi, "Teslim Süresi"],
        [TedarikciColumns.gecTeslimatOrani, "Geç Teslimat Oranı"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
