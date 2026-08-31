export const PREFIX = "cr545_";

/** Talepler tablosundan dataset üzerinden okunacak sütunlar. */
export const TalepColumns = {
    talepMetni: `${PREFIX}talepmetni`,
    urunTipi: `${PREFIX}uruntipi`,
    oncelik: `${PREFIX}oncelik`,
    calisan: `${PREFIX}calisan`,
    olusturulma: "createdon",
} as const;

/**
 * PiyasaArastirmasi tablosu — hangi talebin araştırması var, onu saymak için.
 *
 * Karşılaştırma ekranının sağ yarısı bu tablodan besleniyor; kayıt yoksa
 * satın almacı talebi açtığında boş bir panelle karşılaşıyor.
 */
export const Piyasa = {
    entity: `${PREFIX}piyasaarastirmasi`,
    id: `${PREFIX}piyasaarastirmasiid`,
    talepValue: `_${PREFIX}talep_value`,
} as const;
