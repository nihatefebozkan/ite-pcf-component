/** Tek bir fatura. */
export interface Fatura {
    id: string;
    faturaNo: string | null;
    durumDegeri: number | null;
    durumEtiketi: string | null;
    /** Faturadaki tutar. Net mi brüt mü olduğu belli değil; eşleştirme ikisini de dener. */
    tutar: number | null;
    /** Yüzde (0-100). */
    kdvOrani: number | null;
    siparisId: string | null;
    siparisAdi: string | null;
    /** Dosya adı doluysa PDF eki vardır. */
    pdfAdi: string | null;
    olusturulma: Date | null;
}

/** Siparişten çekilen karşılaştırma verisi. */
export interface SiparisBilgisi {
    tutar: number | null;
    siparisNo: string | null;
}

/** Fatura ile sipariş tutarının karşılaştırma sonucu. */
export type EslesmeSonucu =
    | { tip: "net" }
    | { tip: "kdvDahil" }
    | { tip: "uyusmuyor"; fark: number }
    | { tip: "bilinmiyor"; sebep: string };

export type Suzgec = "tumu" | "islenmemis" | "uyusmayan" | "odenmemis";
