import { FORMATTED_VALUE, Talep } from "../schema";
import { TalepBilgisi } from "../types";

type WebApi = ComponentFramework.WebApi;

/**
 * Siparişlerin durumunu tek seferde çeker.
 *
 * Durum Siparisler'de değil Talepler'de tutuluyor (tek doğru kaynak orası).
 * Her kart için ayrı sorgu atmak yerine sayfadaki talep id'leri toplanıp tek
 * istekte okunuyor; URL uzunluk sınırına takılmamak için parçalara bölünüyor.
 */
const PARCA_BOYUTU = 40;

function metinYada(deger: unknown): string | null {
    return typeof deger === "string" && deger.trim().length > 0 ? deger : null;
}

function sayiYada(deger: unknown): number | null {
    if (typeof deger === "number" && isFinite(deger)) return deger;
    if (typeof deger === "string" && deger.trim() !== "") {
        const n = Number(deger);
        return isFinite(n) ? n : null;
    }
    return null;
}

export async function talepDurumlariGetir(
    webAPI: WebApi,
    talepIdleri: string[]
): Promise<Map<string, TalepBilgisi>> {
    const sonuc = new Map<string, TalepBilgisi>();
    const benzersiz = Array.from(new Set(talepIdleri.filter((id) => id.length > 0)));
    if (benzersiz.length === 0) return sonuc;

    for (let i = 0; i < benzersiz.length; i += PARCA_BOYUTU) {
        const parca = benzersiz.slice(i, i + PARCA_BOYUTU);
        const kosul = parca.map((id) => `${Talep.id} eq ${id}`).join(" or ");

        try {
            const cevap = await webAPI.retrieveMultipleRecords(
                Talep.entity,
                `?$select=${Talep.id},${Talep.talepMetni},${Talep.durum},${Talep.urunTipi}` +
                    `&$filter=${kosul}`
            );

            for (const kayit of cevap.entities) {
                const id = String(kayit[Talep.id]).replace(/[{}]/g, "");
                sonuc.set(id, {
                    metin: metinYada(kayit[Talep.talepMetni]),
                    durumDegeri: sayiYada(kayit[Talep.durum]),
                    durumEtiketi: metinYada(kayit[`${Talep.durum}${FORMATTED_VALUE}`]),
                    // Choice olabilir; etiketi önce annotation'dan dene.
                    urunTipi:
                        metinYada(kayit[`${Talep.urunTipi}${FORMATTED_VALUE}`]) ??
                        metinYada(kayit[Talep.urunTipi]),
                });
            }
        } catch {
            // Durum çekilemezse kart "durum okunamadı" gösterir; ekranı
            // bu yüzden düşürmeye değmez.
        }
    }

    return sonuc;
}
