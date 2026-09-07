import { FaturaColumns } from "../schema";
import { Fatura } from "../types";

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

export function faturalariEsle(dataset: DataSet): Fatura[] {
    const mevcut = mevcutSutunlar(dataset);

    return dataset.sortedRecordIds.map((id) => {
        const record = dataset.records[id];
        return {
            id: record.getRecordId(),
            faturaNo: metin(record, FaturaColumns.faturaNo, mevcut),
            durumDegeri: sayi(record, FaturaColumns.durum, mevcut),
            durumEtiketi: metin(record, FaturaColumns.durum, mevcut),
            tutar: sayi(record, FaturaColumns.tutar, mevcut),
            kdvOrani: sayi(record, FaturaColumns.kdvOrani, mevcut),
            siparisId: mevcut.has(FaturaColumns.siparis)
                ? guidCikar(record.getValue(FaturaColumns.siparis))
                : null,
            siparisAdi: metin(record, FaturaColumns.siparis, mevcut),
            pdfAdi:
                metin(record, FaturaColumns.pdfAdi, mevcut) ??
                metin(record, FaturaColumns.pdfDosya, mevcut),
            olusturulma: tarih(record, FaturaColumns.olusturulma, mevcut),
        };
    });
}

/** Görünümde eksik olan sütunlar — kullanıcıya uyarı olarak gösterilir. */
export function eksikSutunlar(dataset: DataSet): string[] {
    const mevcut = mevcutSutunlar(dataset);
    const gerekli: [string, string][] = [
        [FaturaColumns.faturaNo, "Fatura No"],
        [FaturaColumns.durum, "Fatura Durumu"],
        [FaturaColumns.tutar, "Tutar"],
        [FaturaColumns.kdvOrani, "KDV Oranı"],
        [FaturaColumns.siparis, "Sipariş"],
    ];

    const eksik = gerekli.filter(([ad]) => !mevcut.has(ad)).map(([, etiket]) => etiket);

    // PDF iki sütundan biriyle karşılanıyor; ikisi de yoksa ek varken bile
    // "PDF eki yok" görünür, bu yüzden ayrıca uyarılıyor.
    if (!mevcut.has(FaturaColumns.pdfAdi) && !mevcut.has(FaturaColumns.pdfDosya)) {
        eksik.push("PDF Dosya");
    }

    return eksik;
}
