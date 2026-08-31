import { Piyasa } from "../schema";

type WebApi = ComponentFramework.WebApi;

/**
 * Hangi talebin kaç piyasa araştırması kaydı olduğunu tek seferde çeker.
 *
 * Her kart için ayrı sorgu atmak yerine sayfadaki talep id'leri toplanıp
 * tek istekte okunuyor; sayım istemci tarafında yapılıyor çünkü OData
 * gruplama desteği ortamdan ortama değişiyor ve kayıt sayısı zaten küçük.
 */
const PARCA_BOYUTU = 40;

export async function piyasaSayilariGetir(
    webAPI: WebApi,
    talepIdleri: string[]
): Promise<Map<string, number>> {
    const sonuc = new Map<string, number>();
    const benzersiz = Array.from(new Set(talepIdleri.filter((id) => id.length > 0)));
    if (benzersiz.length === 0) return sonuc;

    // Sorgu başarısız olursa "araştırma yok" gibi görünmesin diye önce hepsini
    // sıfırla başlatmıyoruz; eksik anahtar "bilinmiyor" anlamına geliyor.
    for (let i = 0; i < benzersiz.length; i += PARCA_BOYUTU) {
        const parca = benzersiz.slice(i, i + PARCA_BOYUTU);
        const kosul = parca.map((id) => `${Piyasa.talepValue} eq ${id}`).join(" or ");

        try {
            const cevap = await webAPI.retrieveMultipleRecords(
                Piyasa.entity,
                `?$select=${Piyasa.talepValue}&$filter=${kosul}`
            );

            // Bu parçadaki her talep için en az sıfır kaydı olduğunu biliyoruz.
            for (const id of parca) {
                if (!sonuc.has(id)) sonuc.set(id, 0);
            }

            for (const kayit of cevap.entities) {
                const ham: unknown = kayit[Piyasa.talepValue];
                if (typeof ham !== "string") continue;
                const id = ham.replace(/[{}]/g, "");
                sonuc.set(id, (sonuc.get(id) ?? 0) + 1);
            }
        } catch {
            // Bu parça okunamadıysa o taleplerin sayısı bilinmiyor kalır;
            // kartta "araştırma yok" yazmaktansa hiçbir şey yazmamak doğru.
        }
    }

    return sonuc;
}
