import { activeRules, RuleConfig } from "../config/businessRules";
import { Supplier } from "../types";

/**
 * İş kuralları doğrulama katmanı.
 *
 * config/businessRules.ts'i bir dil modeli üretiyor; bu yüzden içeriğine
 * güvenilmez. Buradaki iş, hatalı bir yayının ekranı çökertmesini ya da sessizce
 * yanlış skor üretmesini engellemek: değerler düzeltilir, her düzeltme
 * kullanıcıya gösterilmek üzere bir uyarı metnine dönüşür.
 */

/** Skorlanan kriterler — Supplier üzerindeki sayısal alanlarla birebir. */
export type WeightKey = Extract<
    keyof Supplier,
    "fiyat" | "teslimSuresi" | "gecTeslimatOrani" | "garantiSuresi" | "surdurulebilirlikPuani"
>;

export type Weights = Record<WeightKey, number>;

export interface ResolvedRules {
    kdvOrani: number;
    paraBirimi: string;
    weights: Weights;
}

export interface RulesResolution {
    rules: ResolvedRules;
    /** Boş değilse yapılandırmada düzeltilen bir sorun var; arayüzde gösterilir. */
    warnings: string[];
}

/** businessRules.ts okunamayacak durumdaysa devreye giren güvenli varsayılan. */
const FALLBACK: ResolvedRules = {
    kdvOrani: 20,
    paraBirimi: "TRY",
    weights: {
        fiyat: 0.4,
        teslimSuresi: 0.2,
        gecTeslimatOrani: 0.1,
        garantiSuresi: 0.2,
        surdurulebilirlikPuani: 0.1,
    },
};

const WEIGHT_FIELDS: { key: WeightKey; field: keyof RuleConfig; label: string }[] = [
    { key: "fiyat", field: "fiyatAgirligi", label: "Fiyat" },
    { key: "teslimSuresi", field: "teslimSuresiAgirligi", label: "Teslim süresi" },
    { key: "gecTeslimatOrani", field: "gecTeslimatAgirligi", label: "Geç teslimat" },
    { key: "garantiSuresi", field: "garantiAgirligi", label: "Garanti" },
    { key: "surdurulebilirlikPuani", field: "surdurulebilirlikAgirligi", label: "Sürdürülebilirlik" },
];

/** Toplamın 1.0 sayılması için kabul edilen sapma — kayan nokta payı. */
const SUM_TOLERANCE = 0.001;

function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && isFinite(value) && value >= 0;
}

/**
 * Etkin kuralları üretir. Asla hata fırlatmaz; bozuk her alan varsayılana
 * düşer ve gerekçesi `warnings` içinde döner.
 */
export function resolveRules(): RulesResolution {
    const warnings: string[] = [];
    const config: Partial<RuleConfig> = activeRules ?? {};

    // --- KDV ---
    let kdvOrani = FALLBACK.kdvOrani;
    if (isPositiveNumber(config.kdvOrani) && config.kdvOrani <= 100) {
        kdvOrani = config.kdvOrani;
    } else if (config.kdvOrani !== undefined) {
        warnings.push(
            `KDV oranı geçersiz (${String(config.kdvOrani)}); %${FALLBACK.kdvOrani} varsayıldı.`
        );
    }

    // --- Para birimi ---
    let paraBirimi = FALLBACK.paraBirimi;
    const kod = typeof config.paraBirimi === "string" ? config.paraBirimi.trim().toUpperCase() : "";
    if (/^[A-Z]{3}$/.test(kod)) {
        paraBirimi = kod;
    } else if (kod.length > 0) {
        warnings.push(`Para birimi kodu geçersiz ("${kod}"); ${FALLBACK.paraBirimi} varsayıldı.`);
    }

    // --- Ağırlıklar ---
    const raw: Weights = { ...FALLBACK.weights };
    let anyInvalid = false;

    for (const { key, field, label } of WEIGHT_FIELDS) {
        const value = config[field];
        if (isPositiveNumber(value)) {
            raw[key] = value;
        } else {
            anyInvalid = true;
            warnings.push(`${label} ağırlığı geçersiz (${String(value)}); varsayılan kullanıldı.`);
        }
    }

    const sum = WEIGHT_FIELDS.reduce((total, { key }) => total + raw[key], 0);
    let weights = raw;

    if (sum <= 0) {
        weights = { ...FALLBACK.weights };
        warnings.push("Ağırlıkların toplamı sıfır; varsayılan dağılıma dönüldü.");
    } else if (Math.abs(sum - 1) > SUM_TOLERANCE) {
        // Oranları koru, ölçeği düzelt — yöneticinin niyeti korunmuş olur.
        weights = WEIGHT_FIELDS.reduce((acc, { key }) => {
            acc[key] = raw[key] / sum;
            return acc;
        }, {} as Weights);
        if (!anyInvalid) {
            warnings.push(
                `Skor ağırlıklarının toplamı ${sum.toFixed(2)} (1.00 olmalı). ` +
                    `Oranlar korunarak normalleştirildi.`
            );
        }
    }

    return { rules: { kdvOrani, paraBirimi, weights }, warnings };
}

/** KDV dahil tutar. Oran geçersizse net tutarı olduğu gibi döndürür. */
export function withVat(net: number | null, kdvOrani: number): number | null {
    if (net === null) return null;
    return net * (1 + kdvOrani / 100);
}
