import { Onay, OnayDurumDegerleri } from "../schema";
import { Karar } from "../types";

type WebApi = ComponentFramework.WebApi;

/** Süslü parantezli GUID'i OData'nın kabul ettiği çıplak biçime indirir. */
function bareGuid(value: string): string {
    return value.replace(/[{}]/g, "");
}

/**
 * Talebe ait bekleyen onay kaydını bulur.
 *
 * Yalnızca Talep'e göre aramak yetmiyor: talep reddedilip yeniden açılırsa ya da
 * ikinci onay kademesi eklenirse aynı talebe birden fazla onay kaydı bağlanır.
 * Bu yüzden durum da koşula giriyor ve en düşük kademe seçiliyor — sıradaki
 * karar hangisiyse o.
 */
async function bekleyenOnayId(webAPI: WebApi, talepId: string): Promise<string | null> {
    const cevap = await webAPI.retrieveMultipleRecords(
        Onay.entity,
        `?$select=${Onay.id}` +
            `&$filter=${Onay.talepValue} eq ${bareGuid(talepId)}` +
            ` and ${Onay.durum} eq ${OnayDurumDegerleri.onayBekleniyor}` +
            `&$orderby=${Onay.onayKademesi} asc&$top=1`
    );

    if (cevap.entities.length === 0) return null;
    return String(cevap.entities[0][Onay.id]);
}

/**
 * Kararı onay kaydına yazar: durum ve gerekçe tek istekte gider.
 *
 * Talepler.Durum'a dokunulmuyor — mevcut Power Automate akışı Onaylar.Durum
 * değişimini dinleyip talebi ilerletiyor. Zincire buradan girmek iki yerden
 * birden yazmak olurdu.
 */
export async function kararVer(
    webAPI: WebApi,
    talepId: string,
    karar: Karar,
    aciklama: string
): Promise<void> {
    const onayId = await bekleyenOnayId(webAPI, talepId);

    if (onayId === null) {
        throw new Error(
            "Bu talebe ait bekleyen bir onay kaydı bulunamadı. " +
                "Karar başka bir yerden verilmiş ya da onay kaydı henüz oluşmamış olabilir."
        );
    }

    await webAPI.updateRecord(Onay.entity, onayId, {
        [Onay.durum]:
            karar === "onayla" ? OnayDurumDegerleri.onaylandi : OnayDurumDegerleri.reddedildi,
        [Onay.aciklama]: aciklama,
    });
}
