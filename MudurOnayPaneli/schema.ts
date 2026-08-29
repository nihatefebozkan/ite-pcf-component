/**
 * Dataverse şema haritası.
 *
 * Talepler tablosunun logical name'i burada yok — dataset'in
 * `getTargetEntityType()` metodundan çalışma zamanında geliyor.
 */
export const PREFIX = "cr545_";

/** Talepler tablosundan dataset üzerinden okunacak sütunlar. */
export const TalepColumns = {
    talepMetni: `${PREFIX}talepmetni`,
    urunTipi: `${PREFIX}uruntipi`,
    oncelik: `${PREFIX}oncelik`,
    durum: `${PREFIX}durum`,
    aiGuvenSkoru: `${PREFIX}aiguvenskoru`,
    calisan: `${PREFIX}calisan`,
    olusturulma: "createdon",
} as const;

/** Onaylar tablosu — kararın yazıldığı yer. */
export const Onay = {
    entity: `${PREFIX}onaylar`,
    id: `${PREFIX}onaylarid`,
    durum: `${PREFIX}durum`,
    /** Memo tipinde; gerekçe uzunluğu sınırı yok. Dataverse'de "i" eksik yazılmış. */
    aciklama: `${PREFIX}acklama`,
    onayKademesi: `${PREFIX}onaykademesi`,
    /** Talep lookup'ının okuma alanı. */
    talepValue: `_${PREFIX}talep_value`,
} as const;

/**
 * Onaylar.Durum seçenek değerleri (`cr545_onaylar_cr545_durum`).
 *
 * DİKKAT: Bu sayılar Talepler.Durum'dakilerle ÇAKIŞIYOR ama farklı anlama
 * geliyor. 479490000 burada "Onaylandi", Talepler'de "Talep Olusturuldu".
 * İki seçenek kümesi ayrı; birini diğerinin yerine kullanmayın.
 */
export const OnayDurumDegerleri = {
    onaylandi: 479490000,
    onayBekleniyor: 479490001,
    reddedildi: 479490002,
} as const;
