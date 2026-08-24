/**
 * Dataverse şema haritası — ortamdan doğrulanmış logical/schema adları.
 *
 * İki adlandırma birbirine karışmasın:
 *  - logical name  → $select, $filter ve entity adı olarak kullanılır (küçük harf)
 *  - schema name   → yalnızca lookup yazarken, `<SchemaName>@odata.bind` biçiminde
 *
 * EntitySetName'ler ortamdan doğrulandı (EntityDefinitions sorgusu, 2026-08-21)
 * ve yalnızca lookup yazma yolunda (@odata.bind) kullanılıyorlar.
 * Siparisler'in entity set adı cr545_siparislers'tir; hiçbir lookup bir Sipariş
 * kaydına bağlanmadığı için burada tanımlı değil.
 */
export const PREFIX = "cr545_";

export const Schema = {
    /**
     * Talep kaydının adı ve tablo adı çalışma zamanında contextInfo'dan geldiği
     * için burada tutulmuyor; `entity` yalnızca contextInfo'nun boş olduğu
     * durumlar (test harness) için yedektir.
     *
     * DİKKAT: Talep tarafındaki sütun UrunTipi, tedarikçi tarafındaki ise
     * UrunKategorisi. Kategori filtresi bu iki farklı isimli sütunu eşleştirir.
     */
    talep: {
        entity: `${PREFIX}talepler`,
        entitySet: `${PREFIX}taleplers`,
        urunTipi: `${PREFIX}uruntipi`,
        oncelik: `${PREFIX}oncelik`,
        durum: `${PREFIX}durum`,
    },

    tedarikci: {
        entity: `${PREFIX}tedarikciler`,
        entitySet: `${PREFIX}tedarikcilers`,
        id: `${PREFIX}tedarikcilerid`,
        ad: `${PREFIX}ad`,
        urunKategorisi: `${PREFIX}urunkategorisi`,
        anlasmaliTedarikci: `${PREFIX}anlasmalitedarikci`,
        fiyat: `${PREFIX}fiyat`,
        teslimSuresi: `${PREFIX}teslimsuresi`,
        gecTeslimatOrani: `${PREFIX}gecteslimatorani`,
        garantiSuresi: `${PREFIX}garantisuresi`,
        /** Dataverse'de bir "l" eksik yazılmış (surdurebilirlik); kasıtlı, dokunma. */
        surdurulebilirlikPuani: `${PREFIX}surdurebilirlikpuani`,
    },

    piyasa: {
        entity: `${PREFIX}piyasaarastirmasi`,
        id: `${PREFIX}piyasaarastirmasiid`,
        kaynakSite: `${PREFIX}kaynaksite`,
        urunAdi: `${PREFIX}urunadi`,
        bulunanFiyat: `${PREFIX}bulunanfiyat`,
        urunLinki: `${PREFIX}urunlinki`,
        karsilastirmaNotu: `${PREFIX}karsilastirmanotu`,
        /** Talep lookup'ının okuma alanı (_<logical>_value). */
        talepValue: `_${PREFIX}talep_value`,
    },

    siparis: {
        entity: `${PREFIX}siparisler`,
        id: `${PREFIX}siparislerid`,
        talepValue: `_${PREFIX}talep_value`,
        talepNav: `${PREFIX}Talep`,
        tedarikciValue: `_${PREFIX}tedarikci_value`,
        tedarikciNav: `${PREFIX}Tedarikci`,
        tutar: `${PREFIX}tutar`,
        secimGerekcesi: `${PREFIX}secimgerekcesi`,
        piyasaKarsilastirmaSonucu: `${PREFIX}piyasakarsilastirmasonucu`,
    },
} as const;

/**
 * SecimGerekcesi / PiyasaKarsilastirmaSonucu sütunlarının MaxLength'i bilinmiyor.
 * Üretilen metinler bu uzunlukta kırpılır; sütunlar tek satırlık metin (100) ise
 * bu değeri 100'e çekin, aksi halde Dataverse yazma isteğini reddeder.
 */
export const MAX_TEXT_LENGTH = 400;

/** Formatted value annotation'ı — Choice alanların etiketini okumak için. */
export const FORMATTED_VALUE = "@OData.Community.Display.V1.FormattedValue";
