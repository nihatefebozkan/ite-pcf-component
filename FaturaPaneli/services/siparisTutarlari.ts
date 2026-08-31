import { Siparis } from "../schema";
import { SiparisBilgisi } from "../types";

type WebApi = ComponentFramework.WebApi;

/**
 * Faturaların karşılaştırılacağı sipariş tutarlarını tek seferde çeker.
 *
 * Üç yönlü eşleştirmenin çekirdeği bu: faturadaki tutar, siparişte kararlaştırılan
 * tutarla aynı mı? Kart başına ayrı sorgu yerine sayfadaki sipariş id'leri
 * toplanıp tek istekte okunuyor.
 */
const PARCA_BOYUTU = 40;

function sayiYada(deger: unknown): number | null {
    if (typeof deger === "number" && isFinite(deger)) return deger;
    if (typeof deger === "string" && deger.trim() !== "") {
        const n = Number(deger);
        return isFinite(n) ? n : null;
    }
    return null;
}

function metinYada(deger: unknown): string | null {
    return typeof deger === "string" && deger.trim().length > 0 ? deger : null;
}

export async function siparisTutarlariGetir(
    webAPI: WebApi,
    siparisIdleri: string[]
): Promise<Map<string, SiparisBilgisi>> {
    const sonuc = new Map<string, SiparisBilgisi>();
    const benzersiz = Array.from(new Set(siparisIdleri.filter((id) => id.length > 0)));
    if (benzersiz.length === 0) return sonuc;

    for (let i = 0; i < benzersiz.length; i += PARCA_BOYUTU) {
        const parca = benzersiz.slice(i, i + PARCA_BOYUTU);
        const kosul = parca.map((id) => `${Siparis.id} eq ${id}`).join(" or ");

        try {
            const cevap = await webAPI.retrieveMultipleRecords(
                Siparis.entity,
                `?$select=${Siparis.id},${Siparis.tutar},${Siparis.siparisNo}&$filter=${kosul}`
            );

            for (const kayit of cevap.entities) {
                const id = String(kayit[Siparis.id]).replace(/[{}]/g, "");
                sonuc.set(id, {
                    tutar: sayiYada(kayit[Siparis.tutar]),
                    siparisNo: metinYada(kayit[Siparis.siparisNo]),
                });
            }
        } catch {
            // Sipariş okunamazsa eşleştirme "bilinmiyor" olur; sessizce
            // "uyuşuyor" demektense bilmediğimizi söylemek doğru.
        }
    }

    return sonuc;
}
