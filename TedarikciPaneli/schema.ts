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
