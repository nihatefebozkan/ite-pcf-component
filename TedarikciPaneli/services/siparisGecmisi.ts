import { Siparis } from "../schema";
import { SiparisKaydi } from "../types";

type WebApi = ComponentFramework.WebApi;

/**
 * Ekrandaki tedarikçilere verilmiş siparişleri tek seferde çeker.
 *
 * Her tedarikçi için ayrı sorgu atmak yerine sayfadaki id'ler toplanıp tek
 * istekte okunuyor; URL uzunluk sınırına takılmamak için parçalara bölünüyor.
 * Sonuç, tedarikçi id'sine göre gruplanmış hâlde dönüyor.
 */
const PARCA_BOYUTU = 25;

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

function tarihYada(deger: unknown): Date | null {
    if (typeof deger !== "string" || deger.trim() === "") return null;
    const t = new Date(deger);
    return isNaN(t.getTime()) ? null : t;
}

function temizle(guid: string): string {
    return guid.replace(/[{}]/g, "").toLowerCase();
}

export async function siparisGecmisiGetir(
    webAPI: WebApi,
    tedarikciIdleri: string[]
): Promise<Map<string, SiparisKaydi[]>> {
    const sonuc = new Map<string, SiparisKaydi[]>();
    const benzersiz = Array.from(
        new Set(tedarikciIdleri.map(temizle).filter((id) => id.length > 0))
    );
    if (benzersiz.length === 0) return sonuc;

    const alanlar = [
        Siparis.id,
        Siparis.siparisNo,
        Siparis.tutar,
        Siparis.siparisTarihi,
        Siparis.teslimTarihi,
        Siparis.tedarikciDegeri,
    ].join(",");

    for (let i = 0; i < benzersiz.length; i += PARCA_BOYUTU) {
        const parca = benzersiz.slice(i, i + PARCA_BOYUTU);
        const kosul = parca.map((id) => `${Siparis.tedarikciDegeri} eq ${id}`).join(" or ");

        try {
            const cevap = await webAPI.retrieveMultipleRecords(
                Siparis.entity,
                `?$select=${alanlar}&$filter=${kosul}`
            );

            for (const kayit of cevap.entities) {
                const tedarikciId = metinYada(kayit[Siparis.tedarikciDegeri]);
                if (!tedarikciId) continue;

                const anahtar = temizle(tedarikciId);
                const kaydi: SiparisKaydi = {
                    id: temizle(String(kayit[Siparis.id])),
                    tedarikciId: anahtar,
                    siparisNo: metinYada(kayit[Siparis.siparisNo]),
                    tutar: sayiYada(kayit[Siparis.tutar]),
                    siparisTarihi: tarihYada(kayit[Siparis.siparisTarihi]),
                    teslimTarihi: tarihYada(kayit[Siparis.teslimTarihi]),
                };

                const liste = sonuc.get(anahtar);
                if (liste) liste.push(kaydi);
                else sonuc.set(anahtar, [kaydi]);
            }
        } catch {
            // Geçmiş okunamazsa grup başlığı sipariş sayısını göstermez;
            // tedarikçi listesini bu yüzden düşürmeye değmez.
        }
    }

    return sonuc;
}
