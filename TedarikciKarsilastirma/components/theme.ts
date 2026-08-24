/**
 * Sunum yardımcıları.
 *
 * Renk ve ölçü değerleri BURADA DEĞİL, css/TedarikciKarsilastirma.css içindeki
 * custom property'lerde tanımlıdır. Bu dosya yalnızca "hangi durum hangi sınıfa
 * karşılık gelir" eşlemesini ve biçimlendiricileri tutar; böylece tek bir renk
 * kaynağı olur ve iki yerde birbirinden kayan palet oluşmaz.
 */

/** Skor bandı: 70+ başarı, 45+ uyarı, altı hata. */
export function scoreTone(score: number): { className: string; label: string } {
    if (score >= 70) return { className: "nek-tk-tone--good", label: "Güçlü" };
    if (score >= 45) return { className: "nek-tk-tone--warn", label: "Orta" };
    return { className: "nek-tk-tone--bad", label: "Zayıf" };
}

/** Geç teslimat oranı bandı — burada düşük değer iyidir. */
export function delayTone(rate: number | null): string {
    if (rate === null) return "nek-tk-tone--none";
    if (rate <= 5) return "nek-tk-tone--good";
    if (rate <= 15) return "nek-tk-tone--warn";
    return "nek-tk-tone--bad";
}

/** Verilen sınıflardan boş olanları eleyip birleştirir. */
export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

export function formatCurrency(value: number | null, currency: string): string {
    if (value === null) return "—";
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        // Geçersiz para birimi kodunda sayıyı çıplak göster, kartı düşürme.
        return `${new Intl.NumberFormat("tr-TR").format(value)} ${currency}`;
    }
}

export function formatNumber(value: number | null, suffix = ""): string {
    if (value === null) return "—";
    return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}
