import { Fatura, FaturaDurumDegerleri, Siparis } from "../schema";
import { EslesmeSonucu, Fatura as FaturaTipi, SiparisBilgisi } from "../types";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

export function paraFormatla(tutar: number | null, paraBirimi = "TRY"): string {
    if (tutar === null) return "—";
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: paraBirimi,
            maximumFractionDigits: 2,
        }).format(tutar);
    } catch {
        return `${new Intl.NumberFormat("tr-TR").format(tutar)} ${paraBirimi}`;
    }
}

export function tarihFormatla(tarih: Date | null): string {
    if (!tarih) return "—";
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(tarih);
}

/** Yuvarlama farklarını uyuşmazlık saymamak için tolerans. */
const TOLERANS = 1;

/**
 * Faturayı siparişle karşılaştırır.
 *
 * Sipariş tutarı net (tedarikçi fiyatı), fatura tutarı ise KDV dahil olabilir.
 * Hangi kuralın geçerli olduğu veriden anlaşılmıyor, bu yüzden ikisi de
 * deneniyor: körü körüne net karşılaştırma yapılsa her fatura KDV oranı kadar
 * uyuşmaz görünür ve uyarı anlamını yitirirdi.
 */
export function eslestir(
    fatura: FaturaTipi,
    siparis: SiparisBilgisi | null | undefined
): EslesmeSonucu {
    if (fatura.siparisId === null) {
        return { tip: "bilinmiyor", sebep: "Fatura bir siparişe bağlı değil." };
    }
    if (!siparis) {
        return { tip: "bilinmiyor", sebep: "İlgili sipariş okunamadı." };
    }
    if (fatura.tutar === null || siparis.tutar === null) {
        return { tip: "bilinmiyor", sebep: "Tutarlardan biri girilmemiş." };
    }

    const netFark = Math.abs(fatura.tutar - siparis.tutar);
    if (netFark <= TOLERANS) return { tip: "net" };

    if (fatura.kdvOrani !== null) {
        const brutBeklenen = siparis.tutar * (1 + fatura.kdvOrani / 100);
        if (Math.abs(fatura.tutar - brutBeklenen) <= TOLERANS) return { tip: "kdvDahil" };
    }

    return { tip: "uyusmuyor", fark: fatura.tutar - siparis.tutar };
}

export function eslesmeTonu(sonuc: EslesmeSonucu): string {
    if (sonuc.tip === "uyusmuyor") return "fap-tone--red";
    if (sonuc.tip === "bilinmiyor") return "fap-tone--gri";
    return "fap-tone--yesil";
}

export function eslesmeEtiketi(sonuc: EslesmeSonucu): string {
    if (sonuc.tip === "net") return "Tutarlar eşleşiyor";
    if (sonuc.tip === "kdvDahil") return "KDV dahil eşleşiyor";
    if (sonuc.tip === "bilinmiyor") return "Karşılaştırılamadı";
    return sonuc.fark > 0 ? "Fatura fazla" : "Fatura eksik";
}

/** Fatura durumunun rozet rengi. */
export function durumTonu(durumDegeri: number | null): string {
    if (durumDegeri === FaturaDurumDegerleri.odendi) return "fap-tone--yesil";
    if (durumDegeri === FaturaDurumDegerleri.islendi) return "fap-tone--mavi";
    if (durumDegeri === FaturaDurumDegerleri.muhasebeyeIletildi) return "fap-tone--amber";
    return "fap-tone--gri";
}

/** Muhasebenin henüz elini sürmediği faturalar. */
export function islenmemisMi(durumDegeri: number | null): boolean {
    return (
        durumDegeri === FaturaDurumDegerleri.olusturuldu ||
        durumDegeri === FaturaDurumDegerleri.muhasebeyeIletildi
    );
}

export function odenmemisMi(durumDegeri: number | null): boolean {
    return durumDegeri !== FaturaDurumDegerleri.odendi;
}

/** Faturanın KDV kırılımı; oran yoksa null. */
export function kdvKirilimi(
    tutar: number | null,
    kdvOrani: number | null,
    kdvDahilMi: boolean
): { net: number; kdv: number; brut: number } | null {
    if (tutar === null || kdvOrani === null || kdvOrani < 0) return null;

    const carpan = 1 + kdvOrani / 100;
    const net = kdvDahilMi ? tutar / carpan : tutar;
    const brut = kdvDahilMi ? tutar : tutar * carpan;
    return { net, kdv: brut - net, brut };
}

/**
 * PDF ekinin indirme adresi. File sütununun içeriğine Web API üzerinden
 * doğrudan erişiliyor; uygulama içinde göreli yol yeterli.
 */
export function pdfAdresi(faturaId: string): string {
    return `/api/data/v9.2/${Fatura.entitySet}(${faturaId})/${Fatura.pdfAlani}/$value`;
}

/** Sipariş numarası — çekilemezse lookup'ın görünen adına düşülür. */
export function siparisEtiketi(
    fatura: FaturaTipi,
    siparis: SiparisBilgisi | null | undefined
): string {
    return siparis?.siparisNo ?? fatura.siparisAdi ?? "Siparişe bağlı değil";
}

export { Siparis };
