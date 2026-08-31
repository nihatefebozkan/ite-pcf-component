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
    kullanilanTutar: `${PREFIX}kullanilantutar`,
} as const;
