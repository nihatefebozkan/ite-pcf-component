import { ScoreFactor, ScoredSupplier, Supplier } from "../types";

/**
 * GEÇİCİ SKORLAMA — ileride AI Builder tahmin modeliyle değiştirilecek.
 *
 * Aday tedarikçi kümesi içinde her kriteri min-max normalize eder, ağırlıklandırır
 * ve 0-100 arası tek bir skora indirger. Tüm mantık bu dosyada izole tutuldu:
 * AI Builder'a geçişte `scoreSuppliers` imzası korunarak gövdesi değiştirilebilir.
 */

interface Criterion {
    key: keyof Supplier;
    label: string;
    weight: number;
    /** true ise düşük değer daha iyidir (fiyat, teslim süresi, geç teslimat). */
    lowerIsBetter: boolean;
}

export const CRITERIA: Criterion[] = [
    { key: "fiyat", label: "Fiyat", weight: 0.35, lowerIsBetter: true },
    { key: "teslimSuresi", label: "Teslim süresi", weight: 0.2, lowerIsBetter: true },
    { key: "gecTeslimatOrani", label: "Zamanında teslimat", weight: 0.2, lowerIsBetter: true },
    { key: "surdurulebilirlikPuani", label: "Sürdürülebilirlik", weight: 0.15, lowerIsBetter: false },
    { key: "garantiSuresi", label: "Garanti", weight: 0.1, lowerIsBetter: false },
];

const NEUTRAL = 0.5;

function numericValue(supplier: Supplier, key: keyof Supplier): number | null {
    const raw = supplier[key];
    return typeof raw === "number" && isFinite(raw) ? raw : null;
}

/**
 * Bir kriteri aday kümesi içinde 0-1 aralığına taşır. Tüm adaylar aynı değerdeyse
 * ya da değer boşsa nötr (0.5) döner — böylece eksik veri ne ödül ne ceza olur.
 */
function normalize(values: (number | null)[], value: number | null, lowerIsBetter: boolean): number {
    if (value === null) return NEUTRAL;

    const present = values.filter((v): v is number => v !== null);
    if (present.length === 0) return NEUTRAL;

    const min = Math.min(...present);
    const max = Math.max(...present);
    if (max === min) return NEUTRAL;

    const ratio = (value - min) / (max - min);
    return lowerIsBetter ? 1 - ratio : ratio;
}

/** En güçlü ve en zayıf kriterlerden kısa bir gerekçe cümlesi üretir. */
function buildRationale(factors: ScoreFactor[]): string {
    const ranked = factors.slice().sort((a, b) => b.normalized - a.normalized);
    const strengths = ranked.filter((f) => f.normalized >= 0.6).slice(0, 2);
    const weakness = ranked[ranked.length - 1];

    const parts: string[] = [];
    if (strengths.length > 0) {
        parts.push(`${strengths.map((f) => f.label.toLocaleLowerCase("tr-TR")).join(" ve ")} tarafında rakiplerinin önünde`);
    }
    if (weakness && weakness.normalized <= 0.4) {
        parts.push(`${weakness.label.toLocaleLowerCase("tr-TR")} tarafında geride kalıyor`);
    }

    if (parts.length === 0) {
        return "Tüm kriterlerde ortalamaya yakın, belirgin bir üstünlüğü veya zayıflığı yok.";
    }
    return parts.join("; ") + ".";
}

/**
 * Aday tedarikçileri skorlar ve skoru yüksekten düşüğe sıralar.
 * Sıralama kararlıdır: eşit skorda alfabetik sıraya düşer.
 */
export function scoreSuppliers(suppliers: Supplier[]): ScoredSupplier[] {
    if (suppliers.length === 0) return [];

    // Her kriter için kümenin tamamındaki değerleri bir kez topla.
    const columns = new Map<keyof Supplier, (number | null)[]>();
    for (const criterion of CRITERIA) {
        columns.set(
            criterion.key,
            suppliers.map((s) => numericValue(s, criterion.key))
        );
    }

    const scored = suppliers.map((supplier) => {
        const factors: ScoreFactor[] = CRITERIA.map((criterion) => {
            const normalized = normalize(
                columns.get(criterion.key)!,
                numericValue(supplier, criterion.key),
                criterion.lowerIsBetter
            );
            return {
                label: criterion.label,
                weight: criterion.weight,
                normalized,
                contribution: normalized * criterion.weight * 100,
            };
        });

        const score = Math.round(factors.reduce((sum, f) => sum + f.contribution, 0));

        return { ...supplier, score, factors, rationale: buildRationale(factors) };
    });

    return scored.sort((a, b) => b.score - a.score || a.ad.localeCompare(b.ad, "tr-TR"));
}
