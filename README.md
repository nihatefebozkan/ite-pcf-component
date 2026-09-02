# ITE PCF Bileşenleri

IT Ekipman Talep ve Satın Alma Sistemi için geliştirilmiş on adet PowerApps Component
Framework (PCF) bileşeni. Bileşenler, Dataverse üzerine kurulu model tabanlı bir
uygulamanın standart form ve liste ekranlarının yetersiz kaldığı yerlerde kullanılıyor.

Sistem, bir kurumda çalışanların IT ekipman taleplerini açtığı, taleplerin yönetici
onayından geçtikten sonra satın alma birimine düştüğü, tedarikçi seçimi ve sipariş
sürecinin yürütüldüğü, sürecin faturalandırmayla kapandığı bir iş akışını kapsıyor.
Bu depo yalnızca arayüz katmanını içeriyor; tablolar, güvenlik rolleri, Power Automate
akışları ve Copilot ajanları Dataverse ortamında tanımlı.

## Bileşenler

| Bileşen | Bağlanma | Kullanım |
|---|---|---|
| `TedarikciKarsilastirma` | Alan (bound) | Talep formunda tam sayfa. Puanlanmış iç tedarikçiler ve piyasa araştırması yan yana; seçim sipariş kaydı oluşturur |
| `CalisanTalepPaneli` | Dataset | Çalışanın kendi talepleri, durum zaman çizelgesiyle |
| `MudurOnayPaneli` | Dataset | Yöneticinin onay kuyruğu |
| `MudurKararGecmisi` | Dataset | Verilmiş onay kararlarının geçmişi |
| `SatinAlmaTalepPaneli` | Dataset | Sipariş bekleyen talepler |
| `SiparisTakipPaneli` | Dataset | Siparişler, ürün kategorisine göre katlanabilir gruplar hâlinde |
| `TedarikciPaneli` | Dataset | Tedarikçi listesi ve performans göstergeleri |
| `PiyasaPaneli` | Dataset | Yapay zekânın ürettiği piyasa araştırması kayıtları |
| `ButcePaneli` | Dataset | Dönem bütçesi; harcanan ve bloke edilen tutar ayrı gösterilir |
| `FaturaPaneli` | Dataset | Fatura, sipariş ve KDV arasında üç yönlü tutar eşleştirmesi |

Tümü `control-type="virtual"` ve platformun sağladığı React sürümünü kullanıyor.
Ek bir arayüz kütüphanesi ya da ikon paketi yok.

## Gereksinimler

- Node.js 18 veya üzeri (geliştirme sırasında 22.x kullanıldı)
- Power Platform CLI (`pac`) 2.11 veya üzeri
- .NET SDK (çözüm paketini derlemek için)

## Kurulum

```bash
npm install
pac auth create --environment <ortam-url>
```

## Derleme

Tek bir bileşeni yerel önizlemede çalıştırmak için:

```bash
npm start
```

Üretim paketini derlemek için:

```bash
npm run build -- --buildMode production
```

## Dağıtım

Depo birden fazla bileşen içerdiği için `pac pcf push` kullanılmıyor; bu komut tek
manifest kabul ediyor ve her zaman geliştirme modunda derliyor. Bunun yerine tüm
bileşenler tek bir çözüm paketinde toplanıyor.

```bash
./push.sh
```

Betik sırasıyla şunları yapıyor:

1. Uzak depodan güncellemeleri çeker
2. On manifestin yama sürümünü bir artırır
3. Çözümü Release yapılandırmasıyla derler
4. Ortama aktarır ve yayımlar

Aktarım sonrası tarayıcıda sert yenileme (Ctrl+Shift+R) gerekiyor.

Müşteriye teslim için yönetilen paket kullanılmalı:

```
TedarikciKarsilastirmaSolution/bin/Release/TedarikciKarsilastirmaSolution_managed.zip
```

## Yapı

Her bileşen aynı iskeleti izliyor:

```
<BilesenAdi>/
  ControlManifest.Input.xml   bileşen tanımı, dataset ve özellikler
  index.ts                    giriş noktası
  schema.ts                   Dataverse alan adları ve seçenek değerleri
  types.ts                    arayüz tipleri
  css/<BilesenAdi>.css        stiller, ad alanı önekli
  services/                   veri eşleme ve Web API sorguları
  components/                 React bileşenleri
```

Dataverse alan adları hiçbir yerde satır içinde yazılmıyor; her bileşenin `schema.ts`
dosyasında sabit olarak tutuluyor. Alan adları ortamdan metadata sorgusuyla
doğrulanmış durumda.

## Bilinmesi gerekenler

Geliştirme sırasında karşılaşılan ve tekrar etme ihtimali olan konular:

**Sürüm artırımı zorunlu.** Manifest sürümü değişmemiş bir bileşenin kaynakları
Dataverse tarafından güncellenmiyor. Aktarım başarılı görünüyor ama ekranda hiçbir
şey değişmiyor. `push.sh` bu adımı otomatik yapıyor; elle aktarım yapılacaksa sürüm
mutlaka artırılmalı.

**Manifest içinde kesme işareti kullanılamaz.** `description-key` alanının XSD tipi
kesme işaretine izin vermiyor. `npm run build` bunu yakalamıyor, hata yalnızca çözüm
aktarılırken çıkıyor.

**CSS genel kapsamda uygulanıyor.** Manifestte tanımlanan stil dosyası sayfanın
tamamına enjekte ediliyor. Bu yüzden her seçici bileşene özel bir önekle yazılmalı
(`stp-`, `btp-` gibi); öneksiz bir seçici model tabanlı uygulamanın kendi arayüzünü
de etkiler.

**Dataset bileşenlerinde yükseklik.** Kök öğe `allocatedHeight` değerini ve
`overflow-y: auto` kullanmak zorunda. Doğal büyümeye bırakıldığında ızgara sayfa kabı
içeriği kırpıyor ve kaydırma çubuğu görünmüyor.

**Lookup alanları düz metin değil.** Dataset üzerinden gelen lookup değerleri
`EntityReference` nesnesi ve kimlik alanı `{ guid: string }` biçiminde. Doğrudan
string olarak okunduğunda sessizce boş kalıyor.

**Web API seçilmeyen alanı döndürmez.** `$select` listesine yazılmayan bir lookup
yanıtta hiç yer almıyor, hata da vermiyor.

**Platform kütüphanesi sürümü.** React 16.14.0 kullanılıyor. Fluent UI bağımlılığı,
ortamın desteklediği sürümlerin ortamdan ortama değişmesi nedeniyle projeden tamamen
çıkarıldı.

## Yapılandırma

`TedarikciKarsilastirma/config/businessRules.ts` dosyası tedarikçi puanlamasında
kullanılan ağırlıkları ve KDV oranını içeriyor. Dosya, iş kurallarının kod
değişikliği gerektirmeden güncellenebilmesi için uygulama mantığından ayrı tutuluyor.

`services/rules.ts` içindeki `resolveRules` fonksiyonu bu değerleri okurken doğrular,
eksik ya da tutarsız bir yapılandırmada hata fırlatmak yerine varsayılanlara döner ve
kullanıcıya uyarı gösterir.

## Ortam bilgisi

- Yayımcı: `ITEyayimci`, önek `ite`
- Bileşen ad alanı: `ITE`
- Dataverse tablo öneki: `cr545_`
