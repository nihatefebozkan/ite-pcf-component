import { Bulgu, Grup, TalepOzeti } from "../types";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

export function paraFormatla(tutar: number | null, paraBirimi = "TRY"): string {
    if (tutar === null) return "—";
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: paraBirimi,
            maximumFractionDigits: 0,
        }).format(tutar);
    } catch {
        return `${new Intl.NumberFormat("tr-TR").format(tutar)} ${paraBirimi}`;
    }
}

export function ilkSatir(metin: string | null, maxUzunluk = 110): string {
    if (!metin) return "(talep metni okunamadı)";

    const satir = metin.split(/\r?\n/)[0].trim();
    if (satir.length === 0) return "(talep metni okunamadı)";
    return satir.length <= maxUzunluk ? satir : `${satir.slice(0, maxUzunluk - 1)}…`;
}

/**
 * Sadece http/https bağlantılarına izin verir.
 *
 * Bu kayıtları AI dolduruyor; üretilen bir metni doğrudan href'e koymak
 * javascript: gibi şemalara kapı açar. Şema doğrulanmadan link basılmaz.
 */
export function guvenliLink(url: string | null): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
    } catch {
        return null;
    }
}

/**
 * Bulguları talebe göre gruplar; her grupta en ucuz fiyatı hesaplar.
 * Talebe bağlanmamış kayıtlar sona, ayrı bir gruba toplanır — AI yanlış
 * eşleştirme yaptıysa orada görünür.
 */
export function grupla(bulgular: Bulgu[], ozetler: Map<string, TalepOzeti>): Grup[] {
    const haritalar = new Map<string, Bulgu[]>();
    const bagsizlar: Bulgu[] = [];

    for (const bulgu of bulgular) {
        if (bulgu.talepId === null) {
            bagsizlar.push(bulgu);
            continue;
        }
        const liste = haritalar.get(bulgu.talepId);
        if (liste) liste.push(bulgu);
        else haritalar.set(bulgu.talepId, [bulgu]);
    }

    const gruplar: Grup[] = [];

    for (const [talepId, liste] of haritalar) {
        const ozet = ozetler.get(talepId);
        const fiyatlar = liste.map((b) => b.fiyat).filter((f): f is number => f !== null);

        gruplar.push({
            talepId,
            baslik: ozet?.metin
                ? ilkSatir(ozet.metin)
                : (liste[0].talepAdi ?? "(talep okunamadı)"),
            urunTipi: ozet?.urunTipi ?? null,
            // Ucuzdan pahalıya — karşılaştırmada bakılan sıra bu.
            bulgular: liste
                .slice()
                .sort((a, b) => (a.fiyat ?? Infinity) - (b.fiyat ?? Infinity)),
            enUcuz: fiyatlar.length > 0 ? Math.min(...fiyatlar) : null,
        });
    }

    gruplar.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr-TR"));

    if (bagsizlar.length > 0) {
        const fiyatlar = bagsizlar.map((b) => b.fiyat).filter((f): f is number => f !== null);
        gruplar.push({
            talepId: null,
            baslik: "Talebe bağlanmamış kayıtlar",
            urunTipi: null,
            bulgular: bagsizlar.slice().sort((a, b) => (a.fiyat ?? Infinity) - (b.fiyat ?? Infinity)),
            enUcuz: fiyatlar.length > 0 ? Math.min(...fiyatlar) : null,
        });
    }

    return gruplar;
}
