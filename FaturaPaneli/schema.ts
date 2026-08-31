export const PREFIX = "cr545_";

/** Faturalar tablosundan dataset üzerinden okunacak sütunlar. */
export const FaturaColumns = {
    faturaNo: `${PREFIX}faturano`,
    durum: `${PREFIX}faturadurumu`,
    tutar: `${PREFIX}tutar`,
    kdvOrani: `${PREFIX}kdvorani`,
    siparis: `${PREFIX}siparis`,
    /** File sütunu; dosya adı doluysa ek vardır. */
    pdfAdi: `${PREFIX}pdfdosya_name`,
    olusturulma: "createdon",
} as const;

/** PDF indirme yolu için gereken sabitler. */
export const Fatura = {
    entitySet: `${PREFIX}faturalars`,
    pdfAlani: `${PREFIX}pdfdosya`,
} as const;

/**
 * Faturalar.FaturaDurumu seçenek değerleri (`cr545_faturalar_cr545_faturadurumu`).
 *
 * DİKKAT: Bu sayılar Talepler, Onaylar ve Siparisler'in Durum kümeleriyle
 * çakışıyor ama farklı anlama geliyor. Kümeleri birbirinin yerine kullanmayın.
 */
export const FaturaDurumDegerleri = {
    olusturuldu: 479490000,
    muhasebeyeIletildi: 479490001,
    islendi: 479490002,
    odendi: 479490003,
} as const;

/** Siparisler tablosu — üç yönlü eşleştirmede karşılaştırılan tutar. */
export const Siparis = {
    entity: `${PREFIX}siparisler`,
    id: `${PREFIX}siparislerid`,
    tutar: `${PREFIX}tutar`,
    /** Sipariş numarası tablonun birincil ad sütununda; adı değiştirilse de
     *  logical name oluşturulduğu hâliyle kaldı. */
    siparisNo: `${PREFIX}newcolumn`,
} as const;
