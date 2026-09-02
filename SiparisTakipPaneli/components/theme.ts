import { DurumDegerleri } from "../schema";
import { Grup, Siparis, TalepBilgisi } from "../types";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/**
 * Sipariş hâlâ uçuşta mı — teslim edilmiş, faturalanmış ve reddedilmişler
 * listeden düşer. Satın almacının takip etmesi gereken tek grup, kapanmamış
 * olanlar.
 */
const KAPANMIS_DURUMLAR: number[] = [
    DurumDegerleri.teslimEdildi,
    DurumDegerleri.faturalandi,
    DurumDegerleri.reddedildi,
];

export function ucustaMi(durumDegeri: number | null): boolean {
    if (durumDegeri === null) return true;
    return !KAPANMIS_DURUMLAR.includes(durumDegeri);
}

export function durumTonu(durumDegeri: number | null): string {
    if (
        durumDegeri === DurumDegerleri.teslimEdildi ||
        durumDegeri === DurumDegerleri.faturalandi
    ) {
        return "stp-tone--yesil";
    }
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

const KATEGORISIZ = "Kategori belirlenmemiş";

/**
 * Siparişleri kategoriye göre gruplar.
 *
 * Kategori `Siparisler`'de değil `Talepler`'de tutuluyor; toplu sorgudan gelen
 * bilgiden okunuyor. Kategorisi olmayanlar sona, ayrı bir gruba toplanıyor —
 * AI henüz sınıflandırmamış olabilir.
 */
export function gruplaKategoriye(
    siparisler: Siparis[],
    talepler: Map<string, TalepBilgisi>
): Grup[] {
    const haritalar = new Map<string, Siparis[]>();

    for (const siparis of siparisler) {
        const bilgi = siparis.talepId ? talepler.get(siparis.talepId) : undefined;
        const kategori = bilgi?.urunTipi ?? KATEGORISIZ;

        const liste = haritalar.get(kategori);
        if (liste) liste.push(siparis);
        else haritalar.set(kategori, [siparis]);
    }

    const gruplar: Grup[] = [];
    for (const [kategori, liste] of haritalar) {
        gruplar.push({
            kategori,
            // Grup içinde de en eski başta — sırada bekleyen iş öne çıksın.
            siparisler: liste.slice().sort((a, b) => {
                const at = a.sonEpostaTarihi ?? a.olusturulma;
                const bt = b.sonEpostaTarihi ?? b.olusturulma;
                return (at?.getTime() ?? 0) - (bt?.getTime() ?? 0);
            }),
            toplamTutar: liste.reduce((toplam, s) => toplam + (s.tutar ?? 0), 0),
            kontrolSayisi: liste.filter((s) => s.kontrolGerekli).length,
        });
    }

    // Kontrol bekleyeni olan gruplar üstte; kategorisizler en sonda.
    return gruplar.sort((a, b) => {
        if (a.kontrolSayisi !== b.kontrolSayisi) return b.kontrolSayisi - a.kontrolSayisi;
        if (a.kategori === KATEGORISIZ) return 1;
        if (b.kategori === KATEGORISIZ) return -1;
        return a.kategori.localeCompare(b.kategori, "tr-TR");
    });
}
