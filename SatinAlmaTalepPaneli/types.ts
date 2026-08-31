/** Tedarikçi seçimi bekleyen tek bir talep. */
export interface Talep {
    id: string;
    metin: string | null;
    urunTipi: string | null;
    oncelik: string | null;
    calisan: string | null;
    olusturulma: Date | null;
}

export type Suzgec = "tumu" | "arastirmasiz";
