import { ButceDonemi, Tuketim } from "../types";

export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
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

/**
 * Tüketimi hesaplar.
 *
 * Harcanabilir tutar `toplam − kullanılan − bloke`. Bloke, onaylanmış ama
 * henüz faturalanmamış taahhüt; düşülmezse aynı para iki kez taahhüt edilir
 * ve bütçe aşımı ancak faturalar geldiğinde fark edilir.
 *
 * Toplam bütçe yoksa ya da sıfırsa yüzde anlamsız olur; o durumda null döner
 * ve çubuk çizilmez — uydurma bir oran göstermektense hiç göstermemek doğru.
 */
export function tuketimHesapla(donem: ButceDonemi): Tuketim {
    const { toplam, kullanilan, bloke } = donem;

    if (toplam === null) {
        return {
            kalan: null,
            kullanilanYuzde: null,
            blokeYuzde: null,
            toplamYuzde: null,
            asim: false,
        };
    }

    const harcanan = kullanilan ?? 0;
    const rezerve = bloke ?? 0;
    const kalan = toplam - harcanan - rezerve;

    const oranla = (deger: number): number | null => (toplam > 0 ? (deger / toplam) * 100 : null);

    return {
        kalan,
        kullanilanYuzde: oranla(harcanan),
        blokeYuzde: oranla(rezerve),
        toplamYuzde: oranla(harcanan + rezerve),
        asim: kalan < 0,
    };
}

/** Tüketim bandı: %70 altı rahat, %90 altı dikkat, üstü kritik. */
export function tuketimTonu(yuzde: number | null, asim: boolean): string {
    if (asim) return "btp-tone--red";
    if (yuzde === null) return "btp-tone--gri";
    if (yuzde >= 90) return "btp-tone--red";
    if (yuzde >= 70) return "btp-tone--amber";
    return "btp-tone--yesil";
}

export function yuzdeFormatla(yuzde: number | null): string {
    if (yuzde === null) return "—";
    return `%${Math.round(yuzde)}`;
}
