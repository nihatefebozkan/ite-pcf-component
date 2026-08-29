import { DurumDegerleri } from "../schema";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Sipariş hâlâ uçuşta mı — teslim edilmiş ve reddedilmişler listeden düşer. */
export function ucustaMi(durumDegeri: number | null): boolean {
    if (durumDegeri === null) return true;
    return (
        durumDegeri !== DurumDegerleri.teslimEdildi && durumDegeri !== DurumDegerleri.reddedildi
    );
}

export function durumTonu(durumDegeri: number | null): string {
    if (durumDegeri === DurumDegerleri.teslimEdildi) return "stp-tone--yesil";
    if (durumDegeri === DurumDegerleri.reddedildi) return "stp-tone--red";
    if (durumDegeri === DurumDegerleri.kargoda) return "stp-tone--mor";
    if (durumDegeri === DurumDegerleri.satinAlmada) return "stp-tone--amber";
    if (durumDegeri === null) return "stp-tone--gri";
    return "stp-tone--mavi";
}

export function ilkSatir(metin: string | null, maxUzunluk = 110): string {
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

export function paraFormatla(tutar: number | null, paraBirimi: string): string {
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

/** İki tarih arasındaki tam gün farkı. */
export function gunFarki(tarih: Date | null): number | null {
    if (!tarih) return null;
    return Math.max(0, Math.floor((Date.now() - tarih.getTime()) / (24 * 60 * 60 * 1000)));
}

/**
 * Tedarikçiden bu kadar gündür ses çıkmayan sipariş "sessiz" sayılır.
 * Sessizce takılmış siparişleri yakalamanın tek yolu bu — kimse şikayet
 * etmediği sürece fark edilmiyorlar.
 */
export const SESSIZLIK_ESIGI_GUN = 7;

export function sessizMi(sonEposta: Date | null, olusturulma: Date | null): boolean {
    const referans = sonEposta ?? olusturulma;
    const gun = gunFarki(referans);
    return gun !== null && gun >= SESSIZLIK_ESIGI_GUN;
}
