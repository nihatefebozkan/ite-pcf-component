/** Tedarikciler tablosundan gelen tek bir iç tedarikçi. */
export interface Supplier {
    id: string;
    ad: string;
    urunKategorisi: string | null;
    /** Anlaşmalı tedarikçi mi; okunamazsa null. */
    anlasmaliTedarikci: boolean | null;
    fiyat: number | null;
    /** Gün cinsinden. */
    teslimSuresi: number | null;
    /** Yüzde (0-100). */
    gecTeslimatOrani: number | null;
    /** Ay cinsinden. */
    garantiSuresi: number | null;
    /** 0-100 arası puan. */
    surdurulebilirlikPuani: number | null;
}

/** Skorlamada tek bir kriterin katkısı — kart üzerinde gerekçe olarak gösterilir. */
export interface ScoreFactor {
    label: string;
    /** Kriterin 0-1 arası normalize edilmiş performansı. */
    normalized: number;
    /** Bu kriterin toplam skora katkısı (0-100 ölçeğinde). */
    contribution: number;
    weight: number;
}

export interface ScoredSupplier extends Supplier {
    /** 0-100. */
    score: number;
    factors: ScoreFactor[];
    /** İnsan tarafından okunabilir kısa gerekçe. */
    rationale: string;
}

/** PiyasaArastirmasi tablosundan gelen tek bir bulgu. */
export interface MarketFinding {
    id: string;
    kaynakSite: string | null;
    urunAdi: string | null;
    bulunanFiyat: number | null;
    urunLinki: string | null;
    karsilastirmaNotu: string | null;
}

/**
 * Ürün tipi/kategorisi hem metin hem Choice sütunu olabilir; OData filtresi
 * ikisinde farklı yazıldığı için ham değeri tipiyle birlikte taşıyoruz.
 */
export type CategoryKey = string | number;

/** Formda açık olan Talep kaydının bağlamı. */
export interface TalepContext {
    id: string | null;
    ad: string | null;
    /** Talepler.UrunTipi — filtrede kullanılacak ham değer. */
    urunTipi: CategoryKey | null;
    /** Ekranda gösterilecek etiket. */
    urunTipiEtiketi: string | null;
    /** Başlıktaki rozetler; yalnızca gösterim amaçlı. */
    oncelikEtiketi: string | null;
    durumEtiketi: string | null;
}

export type LoadState = "idle" | "loading" | "ready" | "error";
