/** Yeni talep formundaki üç öncelik seçeneği. */
export type OncelikSeviyesi = "dusuk" | "orta" | "yuksek";

/** Dataset'ten okunmuş tek bir talep kaydı. */
export interface Talep {
    id: string;
    /** TalepMetni — çalışanın kendi cümleleri. */
    metin: string | null;
    /** UrunTipi etiketi. Flow henüz işlemediyse boş gelir. */
    urunTipi: string | null;
    /** Oncelik etiketi. */
    oncelik: string | null;
    /** Durum etiketi — rozette gösterilir. */
    durum: string | null;
    /** Durum'un seçenek değeri — zaman çizelgesi ve renk buradan türetilir. */
    durumDegeri: number | null;
    olusturulma: Date | null;
}

/** Panelin üç görünümü. Detayda hangi kaydın açık olduğu da taşınır. */
export type Gorunum =
    | { tip: "liste" }
    | { tip: "detay"; talepId: string }
    | { tip: "yeni" };

/** Zaman çizelgesindeki tek bir adımın durumu. */
export type AdimDurumu = "tamamlandi" | "aktif" | "bekliyor" | "reddedildi";

export interface ZamanCizelgesiAdimi {
    etiket: string;
    durum: AdimDurumu;
}
