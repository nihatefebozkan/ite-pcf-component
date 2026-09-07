export const PREFIX = "cr545_";

/** Tedarikciler tablosundan dataset üzerinden okunacak sütunlar. */
export const TedarikciColumns = {
    ad: `${PREFIX}ad`,
    urunKategorisi: `${PREFIX}urunkategorisi`,
    /** Sipariş e-postasının gideceği adres; boşsa o tedarikçiye sipariş verilemez. */
    email: `${PREFIX}email`,
    anlasmali: `${PREFIX}anlasmalitedarikci`,
    fiyat: `${PREFIX}fiyat`,
    teslimSuresi: `${PREFIX}teslimsuresi`,
    gecTeslimatOrani: `${PREFIX}gecteslimatorani`,
    garantiSuresi: `${PREFIX}garantisuresi`,
    /** Dataverse'de bir "l" eksik yazılmış (surdurebilirlik); kasıtlı, dokunma. */
    surdurulebilirlikPuani: `${PREFIX}surdurebilirlikpuani`,
    gecmisSiparisSayisi: `${PREFIX}gecmissiparissayisi`,
    kaynak: `${PREFIX}kaynak`,
} as const;

/**
 * Siparisler tablosu — tedarikçinin sipariş geçmişini çekmek için.
 *
 * Dataset üzerinden değil Web API ile okunuyor; panel Tedarikciler görünümüne
 * bağlı, siparişler ayrı bir tabloda.
 */
export const Siparis = {
    entity: `${PREFIX}siparisler`,
    id: `${PREFIX}siparislerid`,
    /** Birincil sütun; otomatik numara (SIP-00001). Adı "newcolumn" kalmış. */
    siparisNo: `${PREFIX}newcolumn`,
    tutar: `${PREFIX}tutar`,
    siparisTarihi: `${PREFIX}siparistarihi`,
    teslimTarihi: `${PREFIX}teslimtarihi`,
    /** Lookup okunurken _value biçimi kullanılıyor. */
    tedarikciDegeri: `_${PREFIX}tedarikci_value`,
} as const;

export const FORMATTED_VALUE = "@OData.Community.Display.V1.FormattedValue";
