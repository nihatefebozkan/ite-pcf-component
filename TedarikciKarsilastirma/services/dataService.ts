import { FORMATTED_VALUE, Schema } from "../schema";
import { CategoryKey, MarketFinding, Supplier, TalepContext } from "../types";

type WebApi = ComponentFramework.WebApi;
type Entity = ComponentFramework.WebApi.Entity;

/** OData string literal'ı içindeki tek tırnakları kaçırır. */
function odataString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

/** Süslü parantezli GUID'i ({...}) OData'nın kabul ettiği çıplak biçime indirir. */
function bareGuid(value: string): string {
    return value.replace(/[{}]/g, "");
}

function asNumber(value: unknown): number | null {
    return typeof value === "number" && isFinite(value) ? value : null;
}

function asText(value: unknown): string | null {
    return typeof value === "string" && value.length > 0 ? value : null;
}

/** Evet/Hayır sütunu boolean, Choice olarak modellenmişse sayı dönebilir. */
function asBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") return value;
    if (typeof value === "number" && isFinite(value)) return value !== 0;
    return null;
}

/**
 * Bir alanın ekranda gösterilecek metnini verir. Choice sütunlarında ham değer
 * sayıdır; bu durumda Dataverse'in eklediği formatted value annotation'ı okunur.
 */
function displayText(entity: Entity, field: string): string | null {
    return asText(entity[`${field}${FORMATTED_VALUE}`]) ?? asText(entity[field]);
}

/**
 * Filtrede kullanılabilecek ham kategori değeri.
 * Talepler.UrunTipi ve Tedarikciler.UrunKategorisi metin sütunlarıdır; veri
 * girişinden gelen kenar boşlukları eşleşmeyi bozmasın diye kırpılır.
 */
function asCategoryKey(value: unknown): CategoryKey | null {
    if (typeof value === "number" && isFinite(value)) return value;
    const text = asText(value);
    return text ? asText(text.trim()) : null;
}

/**
 * Kategori eşitlik filtresi. Metinde tırnaklı string (Dataverse'de harf durumuna
 * duyarsız), Choice'ta tırnaksız sayı üretir.
 *
 * DİKKAT: Sayısal dal yalnızca iki sütun AYNI global seçenek kümesini
 * paylaşıyorsa doğrudur. Ayrı yerel Choice'lara dönüştürülürlerse değerler
 * çakışır ve filtre boş değil YANLIŞ sonuç verir; o durumda eşleştirmeyi
 * etiket metnine taşıyın.
 */
function categoryFilter(field: string, key: CategoryKey): string {
    return typeof key === "number" ? `${field} eq ${key}` : `${field} eq ${odataString(key)}`;
}

/** Talep bağlamı okunamadığında dönen nötr değer. */
export const EMPTY_TALEP: TalepContext = {
    id: null,
    ad: null,
    urunTipi: null,
    urunTipiEtiketi: null,
    oncelikEtiketi: null,
    durumEtiketi: null,
};

/**
 * Formda açık olan Talep kaydının ürün kategorisini okur — kategori filtresi
 * buradan beslenir.
 *
 * Tablonun logical name'i ve kaydın adı `context.mode.contextInfo`'dan geldiği
 * için burada tahmin edilmez. Tek varsayım kategori sütununun adı; kayıt
 * $select'siz çekilir, böylece sütun beklenenden farklıysa çağrı hata vermez,
 * yalnızca kategori null döner.
 */
export async function fetchTalepContext(
    webAPI: WebApi,
    entityName: string,
    talepId: string | null,
    ad: string | null
): Promise<TalepContext> {
    if (!talepId) return EMPTY_TALEP;

    const record = await webAPI.retrieveRecord(entityName, bareGuid(talepId));
    const alan = Schema.talep.urunTipi;

    return {
        id: bareGuid(talepId),
        ad,
        urunTipi: asCategoryKey(record[alan]),
        urunTipiEtiketi: displayText(record, alan),
        // Kayıt $select'siz çekildiği için bu iki alan zaten elimizde.
        oncelikEtiketi: displayText(record, Schema.talep.oncelik),
        durumEtiketi: displayText(record, Schema.talep.durum),
    };
}

/**
 * İç tedarikçileri çeker. `kategori` verilirse yalnızca o ürün kategorisindekiler
 * gelir; null verilirse tablonun tamamı listelenir.
 */
export async function fetchSuppliers(webAPI: WebApi, kategori: CategoryKey | null): Promise<Supplier[]> {
    const s = Schema.tedarikci;
    const select = [
        s.id,
        s.ad,
        s.urunKategorisi,
        s.anlasmaliTedarikci,
        s.fiyat,
        s.teslimSuresi,
        s.gecTeslimatOrani,
        s.garantiSuresi,
        s.surdurulebilirlikPuani,
    ].join(",");

    let options = `?$select=${select}`;
    if (kategori !== null) {
        options += `&$filter=${categoryFilter(s.urunKategorisi, kategori)}`;
    }

    const response = await webAPI.retrieveMultipleRecords(s.entity, options);

    return response.entities.map((e: Entity) => ({
        id: String(e[s.id]),
        ad: asText(e[s.ad]) ?? "(adsız tedarikçi)",
        urunKategorisi: displayText(e, s.urunKategorisi),
        anlasmaliTedarikci: asBoolean(e[s.anlasmaliTedarikci]),
        fiyat: asNumber(e[s.fiyat]),
        teslimSuresi: asNumber(e[s.teslimSuresi]),
        gecTeslimatOrani: asNumber(e[s.gecTeslimatOrani]),
        garantiSuresi: asNumber(e[s.garantiSuresi]),
        surdurulebilirlikPuani: asNumber(e[s.surdurulebilirlikPuani]),
    }));
}

/**
 * Piyasa araştırması bulgularını çeker. Talep bağlamı varsa yalnızca o talebe
 * bağlı kayıtlar, yoksa en güncel kayıtlar gelir.
 */
export async function fetchMarketFindings(webAPI: WebApi, talepId: string | null): Promise<MarketFinding[]> {
    const p = Schema.piyasa;
    const select = [p.id, p.kaynakSite, p.urunAdi, p.bulunanFiyat, p.urunLinki, p.karsilastirmaNotu].join(",");

    let options = `?$select=${select}`;
    if (talepId) {
        options += `&$filter=${p.talepValue} eq ${bareGuid(talepId)}`;
    }
    options += `&$orderby=${p.bulunanFiyat} asc`;

    const response = await webAPI.retrieveMultipleRecords(p.entity, options);

    return response.entities.map((e: Entity) => ({
        id: String(e[p.id]),
        // KaynakSite Choice sütunu olabilir; etiketini oku.
        kaynakSite: displayText(e, p.kaynakSite),
        urunAdi: asText(e[p.urunAdi]),
        bulunanFiyat: asNumber(e[p.bulunanFiyat]),
        urunLinki: asText(e[p.urunLinki]),
        karsilastirmaNotu: asText(e[p.karsilastirmaNotu]),
    }));
}

export interface OrderPayload {
    tedarikciId: string;
    /** Siparisler.Tutar — seçilen tedarikçinin fiyatı. */
    tutar: number | null;
    /** Siparisler.SecimGerekcesi. */
    secimGerekcesi: string;
    /** Siparisler.PiyasaKarsilastirmaSonucu. */
    piyasaKarsilastirmaSonucu: string;
}

export interface AssignResult {
    action: "updated" | "created";
    siparisId: string;
    /**
     * Açıklama alanları yazılamadıysa sebebi. Tedarikçi ataması yine de
     * kaydedilmiştir — çağıran bunu hata değil uyarı olarak göstermelidir.
     */
    detailWarning: string | null;
}

/**
 * Seçilen tedarikçiyi, açık talebe bağlı Sipariş kaydına yazar.
 *
 * Yazma bilerek iki adıma bölündü: önce uzunluk riski taşımayan alanlar
 * (Tedarici lookup + Tutar), sonra serbest metin alanları. Böylece
 * SecimGerekcesi/PiyasaKarsilastirmaSonucu sütunlarının MaxLength'i üretilen
 * metinden kısaysa asıl işlem — tedarikçi ataması — yine de kalıcı olur.
 *
 * Talebe bağlı bir sipariş yoksa davranış `allowCreate` ile belirlenir:
 * true ise talebe bağlı yeni bir sipariş açılır, false ise hata fırlatılır.
 */
export async function assignSupplierToOrder(
    webAPI: WebApi,
    talepId: string,
    payload: OrderPayload,
    allowCreate: boolean
): Promise<AssignResult> {
    const o = Schema.siparis;
    const talep = bareGuid(talepId);
    const tedarikci = bareGuid(payload.tedarikciId);

    const coreFields: Entity = {
        [`${o.tedarikciNav}@odata.bind`]: `/${Schema.tedarikci.entitySet}(${tedarikci})`,
    };
    if (payload.tutar !== null) {
        coreFields[o.tutar] = payload.tutar;
    }

    const existing = await webAPI.retrieveMultipleRecords(
        o.entity,
        `?$select=${o.id}&$filter=${o.talepValue} eq ${talep}&$top=1`
    );

    let siparisId: string;
    let action: AssignResult["action"];

    if (existing.entities.length > 0) {
        siparisId = String(existing.entities[0][o.id]);
        await webAPI.updateRecord(o.entity, siparisId, coreFields);
        action = "updated";
    } else {
        if (!allowCreate) {
            throw new Error("Bu talebe bağlı bir sipariş kaydı bulunamadı.");
        }
        const created = await webAPI.createRecord(o.entity, {
            ...coreFields,
            [`${o.talepNav}@odata.bind`]: `/${Schema.talep.entitySet}(${talep})`,
        });
        siparisId = created.id;
        action = "created";
    }

    let detailWarning: string | null = null;
    try {
        await webAPI.updateRecord(o.entity, siparisId, {
            [o.secimGerekcesi]: payload.secimGerekcesi,
            [o.piyasaKarsilastirmaSonucu]: payload.piyasaKarsilastirmaSonucu,
        });
    } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        detailWarning = `Gerekçe ve piyasa karşılaştırma metinleri siparişe yazılamadı: ${reason}`;
    }

    return { action, siparisId, detailWarning };
}

/** Talebe bağlı siparişte hâlihazırda seçili olan tedarikçinin id'si (yoksa null). */
export async function fetchSelectedSupplierId(webAPI: WebApi, talepId: string | null): Promise<string | null> {
    if (!talepId) return null;

    const o = Schema.siparis;
    const response = await webAPI.retrieveMultipleRecords(
        o.entity,
        // Lookup değeri de $select'e girmeli; yoksa cevapta hiç dönmez.
        `?$select=${o.id},${o.tedarikciValue}&$filter=${o.talepValue} eq ${bareGuid(talepId)}&$top=1`
    );

    if (response.entities.length === 0) return null;
    const value: unknown = response.entities[0][o.tedarikciValue];
    return typeof value === "string" ? bareGuid(value) : null;
}
