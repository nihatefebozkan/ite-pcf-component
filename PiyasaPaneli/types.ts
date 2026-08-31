/** AI'ın bulduğu tek bir piyasa fiyatı. */
export interface Bulgu {
    id: string;
    kaynakSite: string | null;
    urunAdi: string | null;
    fiyat: number | null;
    link: string | null;
    not: string | null;
    /** Hangi talebe ait; boşsa talebe bağlanmamış bir kayıt. */
    talepId: string | null;
    /** Lookup'ın görünen adı — talep metni çekilemezse buna düşülür. */
    talepAdi: string | null;
}

/** Talebin özeti; grup başlığında gösterilir. */
export interface TalepOzeti {
    metin: string | null;
    urunTipi: string | null;
}

/** Bir talebe ait bulguların bir arada tutulduğu grup. */
export interface Grup {
    talepId: string | null;
    baslik: string;
    urunTipi: string | null;
    bulgular: Bulgu[];
    /** Gruptaki en düşük fiyat; hiç fiyat yoksa null. */
    enUcuz: number | null;
}
