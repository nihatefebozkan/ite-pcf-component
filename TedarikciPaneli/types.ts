/** Havuzdaki tek bir tedarikçi. */
export interface Tedarikci {
    id: string;
    ad: string;
    urunKategorisi: string | null;
    /** Boşsa bu tedarikçiye otomatik sipariş e-postası gönderilemez. */
    email: string | null;
    anlasmali: boolean;
    fiyat: number | null;
    /** Gün cinsinden. */
    teslimSuresi: number | null;
    /** Yüzde (0-100); düşük olan iyi. */
    gecTeslimatOrani: number | null;
    /** Ay cinsinden. */
    garantiSuresi: number | null;
    /** 0-100. */
    surdurulebilirlikPuani: number | null;
    gecmisSiparisSayisi: number | null;
}

export type Suzgec = "tumu" | "anlasmali" | "epostasiz";
