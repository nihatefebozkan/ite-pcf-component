/** Müdürün verebileceği iki karar. */
export type Karar = "onayla" | "reddet";

/** Onay bekleyen tek bir talep. */
export interface Talep {
    id: string;
    metin: string | null;
    urunTipi: string | null;
    oncelik: string | null;
    durum: string | null;
    /** AI'ın kategori tespitine güveni (0-100). Müdür için anlamlı, çalışandan gizli. */
    aiGuvenSkoru: number | null;
    /** Talebi açan çalışanın adı. */
    calisan: string | null;
    olusturulma: Date | null;
}

/** Panelin iki görünümü. */
export type Gorunum = { tip: "liste" } | { tip: "detay"; talepId: string };
