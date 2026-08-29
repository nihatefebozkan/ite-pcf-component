export const PREFIX = "cr545_";

/** Onaylar tablosundan dataset üzerinden okunacak sütunlar. */
export const OnayColumns = {
    durum: `${PREFIX}durum`,
    aciklama: `${PREFIX}acklama`,
    onayKademesi: `${PREFIX}onaykademesi`,
    /** Talep lookup'ının okuma alanı — ilgili talebin id'si buradan gelir. */
    talepValue: `_${PREFIX}talep_value`,
    /** Lookup'ın kendisi; getFormattedValue ile talebin görünen adını verir. */
    talep: `${PREFIX}talep`,
    olusturulma: "createdon",
    /** Karar tarihi olarak kullanılıyor — ayrı bir karar tarihi alanı yok. */
    kararTarihi: "modifiedon",
} as const;

/**
 * Onaylar.Durum seçenek değerleri.
 *
 * DİKKAT: Bu sayılar Talepler.Durum'dakilerle çakışıyor ama farklı anlama
 * geliyor. 479490000 burada "Onaylandi", Talepler'de "Talep Olusturuldu".
 */
export const OnayDurumDegerleri = {
    onaylandi: 479490000,
    onayBekleniyor: 479490001,
    reddedildi: 479490002,
} as const;

/**
 * Talepler tablosu — karar kartında talebin metnini göstermek için tek bir
 * toplu sorguyla okunuyor.
 *
 * Birincil anahtar adı entity logical name + "id" desenine göre türetildi
 * (cr545_onaylar → cr545_onaylarid deseninin aynısı). Yanlışsa metin çekilemez
 * ve kart lookup'ın görünen adına düşer — ekran çalışmaya devam eder.
 */
export const Talep = {
    entity: `${PREFIX}talepler`,
    id: `${PREFIX}taleplerid`,
    talepMetni: `${PREFIX}talepmetni`,
    urunTipi: `${PREFIX}uruntipi`,
    /** Talebi açan çalışan; adı formatted value annotation'ından okunur. */
    calisanValue: `_${PREFIX}calisan_value`,
} as const;

/** Lookup ve Choice alanların görünen metnini taşıyan OData eki. */
export const FORMATTED_VALUE = "@OData.Community.Display.V1.FormattedValue";
