export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Öncelik rozetinin rengi. Dataverse etiketleri Türkçe karaktersiz yazılmış. */
export function oncelikTonu(oncelik: string | null): string {
    if (!oncelik) return "sap-tone--gri";

    const metin = oncelik
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s");

    if (metin.includes("yuksek")) return "sap-tone--red";
    if (metin.includes("orta")) return "sap-tone--amber";
    return "sap-tone--gri";
}

export function ilkSatir(metin: string | null, maxUzunluk = 120): string {
    if (!metin) return "(açıklama girilmemiş)";

    const satir = metin.split(/\r?\n/)[0].trim();
    if (satir.length === 0) return "(açıklama girilmemiş)";
    return satir.length <= maxUzunluk ? satir : `${satir.slice(0, maxUzunluk - 1)}…`;
}

export function tarihFormatla(tarih: Date | null): string {
    if (!tarih) return "—";
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(tarih);
}

export function gunFarki(tarih: Date | null): number | null {
    if (!tarih) return null;
    return Math.max(0, Math.floor((Date.now() - tarih.getTime()) / (24 * 60 * 60 * 1000)));
}

/** Bu günden uzun süredir bekleyen talep vurgulanır. */
export const BEKLEME_ESIGI_GUN = 3;
