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
