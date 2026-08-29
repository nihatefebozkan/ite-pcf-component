/**
 * Sunum yardımcıları. Renk ve ölçüler css/MudurOnayPaneli.css içindeki custom
 * property'lerde; burada yalnızca sınıf eşlemesi ve biçimlendirme var.
 */

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/**
 * Öncelik rozetinin renk sınıfı.
 *
 * Etiket metnine bakılıyor çünkü öncelik dataset'ten biçimli metin olarak
 * geliyor. Dataverse etiketleri Türkçe karaktersiz yazılmış ("Yuksek"),
 * o yüzden karşılaştırma sadeleştirilmiş metin üzerinden.
 */
export function oncelikTonu(oncelik: string | null): string {
    if (!oncelik) return "mop-tone--dusuk";

    const metin = oncelik
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s");

    if (metin.includes("yuksek")) return "mop-tone--yuksek";
    if (metin.includes("orta")) return "mop-tone--orta";
    return "mop-tone--dusuk";
}

/** Kart üzerinde gösterilecek kısa özet — ilk satır, gerekirse kırpılmış. */
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

export function tarihSaatFormatla(tarih: Date | null): string {
    if (!tarih) return "—";
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(tarih);
}

/** Talep açıldığından beri geçen gün — bekleyen talepte gecikmeyi görünür kılar. */
export function bekleyenGun(olusturulma: Date | null): number | null {
    if (!olusturulma) return null;
    const fark = Date.now() - olusturulma.getTime();
    return Math.max(0, Math.floor(fark / (24 * 60 * 60 * 1000)));
}

export function guvenSkoruFormatla(skor: number | null): string {
    if (skor === null) return "—";
    // Alan 0-1 arası da gelebilir, 0-100 arası da; ikisini de yüzdeye çevir.
    const yuzde = skor <= 1 ? skor * 100 : skor;
    return `%${Math.round(yuzde)}`;
}
