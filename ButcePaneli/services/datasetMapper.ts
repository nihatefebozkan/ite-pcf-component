import { ButceColumns } from "../schema";
import { ButceDonemi } from "../types";

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

export function butceleriEsle(dataset: DataSet): ButceDonemi[] {
    const mevcut = mevcutSutunlar(dataset);

    const donemler = dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            donem: metin(record, ButceColumns.donem, mevcut),
            toplam: sayi(record, ButceColumns.toplamButce, mevcut),
            kullanilan: sayi(record, ButceColumns.kullanilanTutar, mevcut),
        };
    });

    // Dönem metni "2026-Q3" gibi sıralanabilir bir biçimde tutuluyor; en yeni
    // dönem başa gelsin ki güncel bütçe ilk kartta olsun.
    return donemler.sort((a, b) =>
        (b.donem ?? "").localeCompare(a.donem ?? "", "tr-TR", { numeric: true })
    );
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [ButceColumns.donem, "Dönem"],
        [ButceColumns.toplamButce, "Toplam Bütçe"],
        [ButceColumns.kullanilanTutar, "Kullanılan Tutar"],
    ];

    return gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);
}
