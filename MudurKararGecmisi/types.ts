/** Listede uygulanabilecek süzgeçler. */
export type Suzgec = "tumu" | "onaylanan" | "reddedilen";

/** Müdürün verdiği tek bir karar. */
export interface Karar {
    id: string;
    /** Onaylar.Durum seçenek değeri. */
    durumDegeri: number | null;
    /** Durum etiketi — Dataverse'ten geldiği hâliyle. */
    durumEtiketi: string | null;
    /** Müdürün yazdığı gerekçe; eski kayıtlarda boş olabilir. */
    aciklama: string | null;
    /** İlgili talebin id'si; metni bununla çekiliyor. */
    talepId: string | null;
    /** Lookup'ın görünen adı — talep metni çekilemezse buna düşülür. */
    talepAdi: string | null;
    kararTarihi: Date | null;
}

/** Toplu sorguyla çekilen talep metinleri, talep id'sine göre. */
export interface TalepOzeti {
    metin: string | null;
    urunTipi: string | null;
    /** Talebi açan çalışanın adı. */
    calisan: string | null;
}
