/** Tek bir bütçe dönemi. */
export interface ButceDonemi {
    id: string;
    /** "2026-Q3" gibi serbest metin. */
    donem: string | null;
    toplam: number | null;
    kullanilan: number | null;
}

/** Hesaplanmış tüketim bilgisi. */
export interface Tuketim {
    /** Kalan tutar; toplam bilinmiyorsa null. Aşımda negatif olur. */
    kalan: number | null;
    /** Tüketim yüzdesi (0-100+); hesaplanamıyorsa null. */
    yuzde: number | null;
    /** Kullanılan tutar toplamı aştı mı. */
    asim: boolean;
}
