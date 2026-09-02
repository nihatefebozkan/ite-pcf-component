export const PREFIX = "cr545_";

/**
 * SirketButce tablosundan dataset üzerinden okunacak sütunlar.
 *
 * Tabloda departman alanı yok — bütçe şirket geneli ve dönemlik tutuluyor.
 * Departman kırılımı gerekirse tabloya yeni bir alan eklenmesi gerekir.
 */
export const ButceColumns = {
    donem: `${PREFIX}donem`,
    toplamButce: `${PREFIX}toplambutce`,
    /** Kesinleşmiş harcama — fatura geldiğinde blokeden buraya geçer. */
    kullanilanTutar: `${PREFIX}kullanilantutar`,
    /**
     * Rezerve edilmiş ama henüz faturalanmamış tutar. Talep onaylandığında
     * bloke edilir, faturalandığında buradan düşüp KullanilanTutar'a geçer.
     * Harcanabilir bütçe hesaplanırken mutlaka düşülmeli — aksi halde aynı
     * para iki kez taahhüt edilebilir.
     */
    blokeTutar: `${PREFIX}bloketutar`,
} as const;
