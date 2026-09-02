/** Tek bir bütçe dönemi. */
export interface ButceDonemi {
    id: string;
    /** "2026-Q3" gibi serbest metin. */
    donem: string | null;
    toplam: number | null;
    /** Kesinleşmiş harcama. */
    kullanilan: number | null;
    /** Onaylanmış ama henüz faturalanmamış taahhüt. */
    bloke: number | null;
}

/** Hesaplanmış tüketim bilgisi. */
export interface Tuketim {
    /**
     * Gerçekten harcanabilir tutar: toplam − kullanılan − bloke.
     * Blokeyi düşmezsek aynı parayı iki kez taahhüt etmiş oluruz.
     */
    kalan: number | null;
    /** Kesinleşmiş harcamanın yüzdesi. */
    kullanilanYuzde: number | null;
    /** Rezerve edilmiş tutarın yüzdesi. */
    blokeYuzde: number | null;
    /** Kullanılan + bloke; bandın rengini bu belirler. */
    toplamYuzde: number | null;
    /** Taahhütler toplam bütçeyi aştı mı. */
    asim: boolean;
}
