import { MAX_TEXT_LENGTH } from "../schema";
import { MarketFinding, ScoredSupplier } from "../types";
import { formatCurrency } from "../components/theme";

/** Sütun MaxLength'ini aşmamak için kırpar; kırpıldığını görünür kılar. */
function clamp(text: string): string {
    return text.length <= MAX_TEXT_LENGTH ? text : `${text.slice(0, MAX_TEXT_LENGTH - 1)}…`;
}

/**
 * Siparisler.SecimGerekcesi alanına yazılacak metin — bu tedarikçinin neden
 * seçildiğini denetim izine bırakır.
 */
export function buildSelectionRationale(supplier: ScoredSupplier, candidateCount: number): string {
    const parts = [
        `${candidateCount} tedarikçi arasından seçildi (skor ${supplier.score}/100).`,
        supplier.rationale,
    ];

    if (supplier.anlasmaliTedarikci === true) {
        parts.push("Anlaşmalı tedarikçi.");
    }

    return clamp(parts.join(" "));
}

/**
 * Piyasa araştırması panelinin altındaki değerlendirme cümlesi. Ekrandaki
 * satırların hepsine tek tek bakmadan "iç tedarik mi, piyasa mı" sorusunu
 * cevaplar. Karşılaştıracak fiyat yoksa null döner ve blok hiç çizilmez.
 */
export function buildMarketConclusion(
    bestInternalPrice: number | null,
    findings: MarketFinding[],
    currency: string
): string | null {
    const prices = findings.map((f) => f.bulunanFiyat).filter((p): p is number => p !== null);
    if (prices.length === 0 || bestInternalPrice === null) return null;

    const cheapest = Math.min(...prices);
    const diff = Math.abs(cheapest - bestInternalPrice);

    if (cheapest < bestInternalPrice) {
        return `Piyasa listelemeleri iç teklifin en fazla ${formatCurrency(diff, currency)} altında kalıyor. Bu fiyatlarda çerçeve anlaşması garantisi ve teslim taahhüdü yok.`;
    }

    return `En iyi iç teklif, piyasadaki en düşük fiyattan ${formatCurrency(diff, currency)} daha uygun. İç tedarik önerilir.`;
}

/**
 * Siparisler.PiyasaKarsilastirmaSonucu alanına yazılacak metin — seçilen
 * teklifin piyasaya göre nerede durduğunu özetler.
 */
export function buildMarketComparison(
    supplier: ScoredSupplier,
    findings: MarketFinding[],
    currency: string
): string {
    const prices = findings.map((f) => f.bulunanFiyat).filter((p): p is number => p !== null);

    if (findings.length === 0) {
        return "Bu talep için piyasa araştırması kaydı bulunmuyor.";
    }

    if (prices.length === 0) {
        return clamp(`${findings.length} piyasa kaydı incelendi, hiçbirinde fiyat bilgisi yok.`);
    }

    const cheapest = Math.min(...prices);
    const cheapestSource = findings.find((f) => f.bulunanFiyat === cheapest)?.kaynakSite;
    const sourceLabel = cheapestSource ? ` (${cheapestSource})` : "";

    const parts = [
        `${findings.length} piyasa kaydı incelendi.`,
        `En düşük piyasa fiyatı ${formatCurrency(cheapest, currency)}${sourceLabel}.`,
    ];

    if (supplier.fiyat !== null && cheapest > 0) {
        const diffPct = Math.round(((supplier.fiyat - cheapest) / cheapest) * 100);
        const verdict =
            diffPct < 0
                ? `piyasadan %${Math.abs(diffPct)} daha uygun`
                : diffPct > 0
                  ? `piyasadan %${diffPct} daha pahalı`
                  : "piyasayla aynı fiyatta";
        parts.push(`Seçilen tedarikçi ${formatCurrency(supplier.fiyat, currency)} ile ${verdict}.`);
    }

    return clamp(parts.join(" "));
}
