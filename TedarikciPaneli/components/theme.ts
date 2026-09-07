import { SiparisKaydi, Tedarikci, TedarikciGrubu } from "../types";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Geç teslimat oranı bandı — burada düşük değer iyidir. */
export function gecTeslimatTonu(oran: number | null): string {
    if (oran === null) return "tdp-tone--gri";
    if (oran <= 5) return "tdp-tone--yesil";
    if (oran <= 15) return "tdp-tone--amber";
    return "tdp-tone--red";
}

export function paraFormatla(tutar: number | null, paraBirimi = "TRY"): string {
    if (tutar === null) return "—";
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: paraBirimi,
            maximumFractionDigits: 0,
        }).format(tutar);
    } catch {
        return `${new Intl.NumberFormat("tr-TR").format(tutar)} ${paraBirimi}`;
    }
}

export function sayiFormatla(deger: number | null, sonek = ""): string {
    if (deger === null) return "—";
    return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(deger)}${sonek}`;
}

export function tarihFormatla(tarih: Date | null): string {
    if (!tarih) return "—";
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(tarih);
}

const ADSIZ = "Adı girilmemiş";

/**
 * Tedarikçileri ada göre gruplar.
 *
 * E-postası eksik satır içeren gruplar en üstte; düzeltilmesi gereken tek grup
 * onlar ve katlanınca gözden kaybolmamaları gerekiyor. Adı boş olan satırlar
 * sona, ayrı bir başlık altında toplanıyor.
 */
export function gruplaTedarikciye(
    tedarikciler: Tedarikci[],
    siparisHaritasi: Map<string, SiparisKaydi[]>
): TedarikciGrubu[] {
    const harita = new Map<string, Tedarikci[]>();

    for (const tedarikci of tedarikciler) {
        const ad = tedarikci.ad.trim().length > 0 ? tedarikci.ad.trim() : ADSIZ;
        const liste = harita.get(ad);
        if (liste) liste.push(tedarikci);
        else harita.set(ad, [tedarikci]);
    }

    const gruplar: TedarikciGrubu[] = [];
    for (const [ad, liste] of harita) {
        // Aynı firmanın her kalemi ayrı bir Tedarikciler satırı ve her satırın
        // kendi id'si var; sipariş geçmişi hepsinin birleşimi.
        const siparisler = liste
            .flatMap((t) => siparisHaritasi.get(t.id.toLowerCase()) ?? [])
            .sort((a, b) => {
                const at = a.siparisTarihi?.getTime() ?? 0;
                const bt = b.siparisTarihi?.getTime() ?? 0;
                return bt - at;
            });

        gruplar.push({
            ad,
            // Grup içinde ürün kategorisine göre — aynı firmanın kalemleri sıralı dursun.
            tedarikciler: liste
                .slice()
                .sort((a, b) =>
                    (a.urunKategorisi ?? "").localeCompare(b.urunKategorisi ?? "", "tr-TR")
                ),
            urunSayisi: liste.length,
            epostasizSayisi: liste.filter((t) => !t.email).length,
            email: liste.find((t) => t.email)?.email ?? null,
            anlasmali: liste.some((t) => t.anlasmali),
            kategoriler: Array.from(
                new Set(
                    liste
                        .map((t) => t.urunKategorisi)
                        .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
                )
            ).sort((a, b) => a.localeCompare(b, "tr-TR")),
            toplamTutar: siparisler.reduce((toplam, s) => toplam + (s.tutar ?? 0), 0),
            siparisler,
        });
    }

    return gruplar.sort((a, b) => {
        const aEksik = a.epostasizSayisi > 0;
        const bEksik = b.epostasizSayisi > 0;
        if (aEksik !== bEksik) return aEksik ? -1 : 1;
        if (a.ad === ADSIZ) return 1;
        if (b.ad === ADSIZ) return -1;
        return a.ad.localeCompare(b.ad, "tr-TR");
    });
}
