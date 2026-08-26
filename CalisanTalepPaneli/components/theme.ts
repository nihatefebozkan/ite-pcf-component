/**
 * Sunum yardımcıları.
 *
 * Renk ve ölçü değerleri burada değil, css/CalisanTalepPaneli.css içindeki
 * custom property'lerde. Bu dosya yalnızca sınıf birleştirme ve biçimlendirme
 * yapar — tek renk kaynağı CSS olsun diye.
 */

/** Boş olanları eleyip sınıf adlarını birleştirir. */
export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Kart üzerinde gösterilecek kısa özet — ilk satır, gerekirse kırpılmış. */
export function ilkSatir(metin: string | null, maxUzunluk = 110): string {
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

/**
 * Kayıt hâlâ arka plan akışları tarafından işleniyor mu?
 *
 * UrunTipi'ni AI kategori akışı dolduruyor ve bu birkaç saniye sürüyor. Boş
 * UrunTipi tek başına yeterli bir işaret değil — eski bir kayıtta da boş
 * kalabilir ve o zaman kart sonsuza kadar "İşleniyor" derdi. Bu yüzden
 * yalnızca yeni oluşturulmuş kayıtlar için gösteriliyor.
 */
const ISLEME_PENCERESI_MS = 2 * 60 * 1000;

export function isleniyorMu(urunTipi: string | null, olusturulma: Date | null): boolean {
    if (urunTipi) return false;
    if (!olusturulma) return false;
    return Date.now() - olusturulma.getTime() < ISLEME_PENCERESI_MS;
}
