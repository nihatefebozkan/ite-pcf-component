export const PREFIX = "cr545_";

/** Siparisler tablosundan dataset üzerinden okunacak sütunlar. */
export const SiparisColumns = {
    /**
     * Sipariş numarası — tablonun birincil ad sütunu.
     * DİKKAT: Görünen adı "SiparisNo" olsa da logical name oluşturulduğu
     * hâliyle kaldı. Yeniden adlandırma logical name'i değiştirmiyor.
     */
    siparisNo: `${PREFIX}newcolumn`,
    talep: `${PREFIX}talep`,
    tedarikci: `${PREFIX}tedarikci`,
    tutar: `${PREFIX}tutar`,
    kontrolGerekli: `${PREFIX}kontrolgerekli`,
    agentNotu: `${PREFIX}agentnotu`,
    sonEpostaTarihi: `${PREFIX}sonepostatarihi`,
    olusturulma: "createdon",
} as const;

/**
 * Talepler tablosu — siparişin durumu buradan okunur.
 *
 * Siparisler'in de kendi Durum alanı var ama tek doğru kaynak Talepler.Durum:
 * çalışan paneli, müdür paneli ve zaman çizelgesi hep ona bakıyor. İki yerde
 * durum tutmak kaçınılmaz olarak ayrışmaya yol açar.
 */
export const Talep = {
    entity: `${PREFIX}talepler`,
    id: `${PREFIX}taleplerid`,
    talepMetni: `${PREFIX}talepmetni`,
    durum: `${PREFIX}durum`,
    /** AI'ın belirlediği kategori; siparişler bunun altında gruplanıyor. */
    urunTipi: `${PREFIX}uruntipi`,
} as const;

/** Talepler.Durum seçenek değerleri — ortamdan doğrulandı. */
export const DurumDegerleri = {
    talepOlusturuldu: 479490000,
    onayBekliyor: 479490001,
    onaylandi: 479490002,
    reddedildi: 479490003,
    satinAlmada: 479490004,
    siparisVerildi: 479490005,
    kargoda: 479490006,
    teslimEdildi: 479490007,
    /** Muhasebe faturayı işledi; sipariş artık uçuşta değil. */
    faturalandi: 479490008,
} as const;

/** Lookup ve Choice alanların görünen metnini taşıyan OData eki. */
export const FORMATTED_VALUE = "@OData.Community.Display.V1.FormattedValue";
