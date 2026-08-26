import { Columns, Onay, OncelikYazmaDegerleri } from "../schema";
import { OncelikSeviyesi } from "../types";

type WebApi = ComponentFramework.WebApi;

/** Süslü parantezli GUID'i OData'nın kabul ettiği çıplak biçime indirir. */
function bareGuid(value: string): string {
    return value.replace(/[{}]/g, "");
}

/**
 * Yeni talep kaydı açar.
 *
 * Yalnızca TalepMetni ve Oncelik yazılır. Calisan ve Durum alanlarını kayıt
 * oluşturulduktan sonra çalışan Power Automate akışları dolduruyor; buradan
 * yazmak o akışlarla yarışa girmek olurdu.
 */
export async function talepOlustur(
    webAPI: WebApi,
    entityName: string,
    metin: string,
    oncelik: OncelikSeviyesi
): Promise<string> {
    const kayit = await webAPI.createRecord(entityName, {
        [Columns.talepMetni]: metin,
        [Columns.oncelik]: OncelikYazmaDegerleri[oncelik],
    });

    return bareGuid(kayit.id);
}

/**
 * Reddedilen talebin gerekçesini Onaylar tablosundan okur.
 *
 * Onaylar tablosunun adları doğrulanmadığı için hata yutuluyor: gerekçe
 * gösterilemezse detay ekranının geri kalanı çalışmaya devam etmeli.
 * Bulunamadığında null döner ve blok hiç çizilmez.
 */
export async function redGerekcesiGetir(webAPI: WebApi, talepId: string): Promise<string | null> {
    try {
        const cevap = await webAPI.retrieveMultipleRecords(
            Onay.entity,
            `?$select=${Onay.aciklama}&$filter=${Onay.talepValue} eq ${bareGuid(talepId)}` +
                `&$orderby=${Onay.olusturulma} desc&$top=1`
        );

        if (cevap.entities.length === 0) return null;

        const aciklama: unknown = cevap.entities[0][Onay.aciklama];
        return typeof aciklama === "string" && aciklama.trim().length > 0 ? aciklama : null;
    } catch {
        return null;
    }
}
