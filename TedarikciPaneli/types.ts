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

/**
 * Aynı ada sahip tedarikçi satırları tek başlık altında toplanır.
 *
 * Tedarikciler tablosunda her satır bir tedarikçi–ürün kategorisi eşleşmesi;
 * "Hepsiburada / Mouse" ile "Hepsiburada / Klavye" iki ayrı satır. Listede
 * aynı firmanın tekrar tekrar görünmesi yerine tek satır gösterilip
 * açıldığında hangi ürünlerde çalışıldığı listeleniyor.
 */
export interface TedarikciGrubu {
    ad: string;
    tedarikciler: Tedarikci[];
    urunSayisi: number;
    epostasizSayisi: number;
    /** Firmanın ilk dolu e-posta adresi; sipariş yazışması buraya gidiyor. */
    email: string | null;
    /** Kalemlerden en az biri anlaşmalıysa firma anlaşmalı sayılıyor. */
    anlasmali: boolean;
    /** Bu firmada çalışılan ürün kategorileri. */
    kategoriler: string[];
    /** Bu firmaya bugüne kadar ödenen toplam. */
    toplamTutar: number;
    /** Bu firmanın tüm kalemlerine verilmiş gerçek siparişler, yeniden eskiye. */
    siparisler: SiparisKaydi[];
}

/** Bir tedarikçiye verilmiş tek sipariş. */
export interface SiparisKaydi {
    id: string;
    tedarikciId: string;
    siparisNo: string | null;
    tutar: number | null;
    siparisTarihi: Date | null;
    teslimTarihi: Date | null;
}
