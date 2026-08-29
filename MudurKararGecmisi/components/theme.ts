import { OnayDurumDegerleri } from "../schema";

/**
 * Sunum yardımcıları. Renkler css/MudurKararGecmisi.css içindeki custom
 * property'lerde; burada yalnızca sınıf eşlemesi ve biçimlendirme var.
 */

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Karar rozetinin metni — müdürün kendi eylemi olarak yazılıyor. */
export function kararEtiketi(durumDegeri: number | null, yedek: string | null): string {
    if (durumDegeri === OnayDurumDegerleri.onaylandi) return "Onayladın";
    if (durumDegeri === OnayDurumDegerleri.reddedildi) return "Reddettin";
    if (durumDegeri === OnayDurumDegerleri.onayBekleniyor) return "Bekliyor";
    return yedek ?? "—";
}

export function kararTonu(durumDegeri: number | null): string {
    if (durumDegeri === OnayDurumDegerleri.onaylandi) return "mkg-tone--onay";
    if (durumDegeri === OnayDurumDegerleri.reddedildi) return "mkg-tone--red";
    return "mkg-tone--gri";
}

/** Kart başlığı — talebin ilk satırı, gerekirse kırpılmış. */
export function ilkSatir(metin: string | null, maxUzunluk = 120): string {
    if (!metin) return "(talep metni okunamadı)";

    const satir = metin.split(/\r?\n/)[0].trim();
    if (satir.length === 0) return "(talep metni okunamadı)";
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
