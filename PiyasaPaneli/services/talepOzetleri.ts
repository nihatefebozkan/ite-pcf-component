import { FORMATTED_VALUE, Talep } from "../schema";
import { TalepOzeti } from "../types";

type WebApi = ComponentFramework.WebApi;

/**
 * Grup başlıklarında gösterilecek talep metinlerini tek seferde çeker.
 * Kart başına ayrı sorgu yerine sayfadaki talep id'leri toplanıp tek istekte
 * okunuyor; URL uzunluk sınırı için parçalara bölünüyor.
 */
const PARCA_BOYUTU = 40;

function metinYada(deger: unknown): string | null {
    return typeof deger === "string" && deger.trim().length > 0 ? deger : null;
}

export async function talepOzetleriGetir(
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
                `?$select=${Talep.id},${Talep.talepMetni},${Talep.urunTipi}&$filter=${kosul}`
            );

            for (const kayit of cevap.entities) {
                const id = String(kayit[Talep.id]).replace(/[{}]/g, "");
                sonuc.set(id, {
                    metin: metinYada(kayit[Talep.talepMetni]),
                    urunTipi:
                        metinYada(kayit[`${Talep.urunTipi}${FORMATTED_VALUE}`]) ??
                        metinYada(kayit[Talep.urunTipi]),
                });
            }
        } catch {
            // Metin çekilemezse grup başlığı lookup'ın adına düşer.
        }
    }

    return sonuc;
}
