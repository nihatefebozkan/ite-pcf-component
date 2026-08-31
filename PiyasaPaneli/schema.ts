export const PREFIX = "cr545_";

/** PiyasaArastirmasi tablosundan dataset üzerinden okunacak sütunlar. */
export const PiyasaColumns = {
    kaynakSite: `${PREFIX}kaynaksite`,
    urunAdi: `${PREFIX}urunadi`,
    bulunanFiyat: `${PREFIX}bulunanfiyat`,
    urunLinki: `${PREFIX}urunlinki`,
    karsilastirmaNotu: `${PREFIX}karsilastirmanotu`,
    talep: `${PREFIX}talep`,
} as const;

/** Talepler tablosu — grup başlığında talebin metnini göstermek için. */
export const Talep = {
    entity: `${PREFIX}talepler`,
    id: `${PREFIX}taleplerid`,
    talepMetni: `${PREFIX}talepmetni`,
    urunTipi: `${PREFIX}uruntipi`,
} as const;

export const FORMATTED_VALUE = "@OData.Community.Display.V1.FormattedValue";
