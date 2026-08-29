import { FORMATTED_VALUE, Talep } from "../schema";
import { TalepOzeti } from "../types";

type WebApi = ComponentFramework.WebApi;
type Entity = ComponentFramework.WebApi.Entity;

function metinYada(deger: unknown): string | null {
    return typeof deger === "string" && deger.trim().length > 0 ? deger : null;
}

/**
 * Lookup ve Choice alanların görünen metni. Model-driven ortamda Web API
 * cevapları formatted value eklerini otomatik taşıyor; ham değer (GUID ya da
 * seçenek numarası) kullanıcıya gösterilmez.
 */
function gorunenMetin(kayit: Entity, alan: string): string | null {
    return metinYada(kayit[`${alan}${FORMATTED_VALUE}`]);
}

/**
 * Karar kartlarında gösterilecek talep metinlerini tek seferde çeker.
 *
 * Onaylar kaydında talebin metni yok, sadece lookup var. Her kart için ayrı
 * sorgu atmak yerine sayfadaki tüm talep id'leri toplanıp tek istekte
 * okunuyor. OData'da "in" operatörü güvenilir değil, o yüzden "or" zinciri
 * kuruluyor ve URL uzunluk sınırına takılmamak için parçalara bölünüyor.
 */
const PARCA_BOYUTU = 40;

export async function talepMetinleriGetir(
    webAPI: WebApi,
    talepIdleri: string[]
): Promise<Map<string, TalepOzeti>> {
    const sonuc = new Map<string, TalepOzeti>();
    const benzersiz = Array.from(new Set(talepIdleri.filter((id) => id.length > 0)));
    if (benzersiz.length === 0) return sonuc;

    for (let i = 0; i < benzersiz.length; i += PARCA_BOYUTU) {
        const parca = benzersiz.slice(i, i + PARCA_BOYUTU);
        const kosul = parca.map((id) => `${Talep.id} eq ${id}`).join(" or ");

        try {
            const cevap = await webAPI.retrieveMultipleRecords(
                Talep.entity,
                `?$select=${Talep.id},${Talep.talepMetni},${Talep.urunTipi},${Talep.calisanValue}` +
                    `&$filter=${kosul}`
            );

            for (const kayit of cevap.entities) {
                const id = String(kayit[Talep.id]).replace(/[{}]/g, "");

                sonuc.set(id, {
                    metin: metinYada(kayit[Talep.talepMetni]),
                    // UrunTipi Choice olabilir; etiketi önce annotation'dan dene.
                    urunTipi: gorunenMetin(kayit, Talep.urunTipi) ?? metinYada(kayit[Talep.urunTipi]),
                    calisan: gorunenMetin(kayit, Talep.calisanValue),
                });
            }
        } catch {
            // Metin çekilemezse kart lookup'ın görünen adına düşüyor;
            // ekranı bu yüzden düşürmeye değmez.
        }
    }

    return sonuc;
}
