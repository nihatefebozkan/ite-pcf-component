/**
 * Dataverse şema haritası.
 *
 * Talepler tablosunun logical name'i burada tutulmuyor — dataset'in
 * `getTargetEntityType()` metodundan çalışma zamanında geliyor, dolayısıyla
 * tahmin edilmiyor.
 */
export const PREFIX = "cr545_";

/** Talepler tablosunun dataset'ten okunacak sütunları. */
export const Columns = {
    talepMetni: `${PREFIX}talepmetni`,
    urunTipi: `${PREFIX}uruntipi`,
    oncelik: `${PREFIX}oncelik`,
    durum: `${PREFIX}durum`,
    olusturulma: "createdon",
} as const;

/**
 * Onaylar tablosu — red gerekçesini okumak için. Ortamdan doğrulandı.
 * İlişki adı: cr545_onaylar_Talep_cr545_talepler
 */
export const Onay = {
    entity: `${PREFIX}onaylar`,
    /** Dataverse'de "i" eksik yazılmış (acklama); kasıtlı değil ama böyle, dokunma. */
    aciklama: `${PREFIX}acklama`,
    /** Talep lookup'ının okuma alanı — lookup logical name'i cr545_talep. */
    talepValue: `_${PREFIX}talep_value`,
    olusturulma: "createdon",
} as const;

/**
 * Oncelik seçenek değerleri (Picklist `cr545_talepler_cr545_oncelik`).
 * Ortamdan doğrulandı — dikkat, sıralama ters: en yüksek öncelik en küçük değer.
 */
export const OncelikYazmaDegerleri: Record<"dusuk" | "orta" | "yuksek", number> = {
    yuksek: 479490000,
    orta: 479490001,
    dusuk: 479490002,
};

/**
 * Durum seçenek değerleri (Picklist `cr545_talepler_cr545_durum`).
 * Ortamdan doğrulandı. Zaman çizelgesi bu sayılara göre kurulur; etiket
 * metnine bakmak yerine değer kullanmak, etiketler değiştiğinde kırılmaz.
 */
export const DurumDegerleri = {
    talepOlusturuldu: 479490000,
    onayBekliyor: 479490001,
    onaylandi: 479490002,
    reddedildi: 479490003,
    satinAlmada: 479490004,
    siparisVerildi: 479490005,
    kargoda: 479490006,
    teslimEdildi: 479490007,
    /** Muhasebe faturayı işledi. Çalışan için teslimattan sonrası; zaman
     *  çizelgesinde ayrı adım açılmıyor, son adıma sayılıyor. */
    faturalandi: 479490008,
} as const;
