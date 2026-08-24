// OTOMATIK URETILEN DOSYA - Copilot Studio bu dosyayi butunuyle degistirir.
// Fonksiyon, import veya kosul EKLEMEYIN; dogrulama services/rules.ts icindedir.
// ISTEK: Fiyat ağırlığını 0.8 yap, kalan dört kriteri eşit dağıt.
// URETIM: Copilot Studio · 2026-08-24
export interface RuleConfig {
    kdvOrani: number;
    paraBirimi: string;
    fiyatAgirligi: number;
    teslimSuresiAgirligi: number;
    gecTeslimatAgirligi: number;
    garantiAgirligi: number;
    surdurulebilirlikAgirligi: number;
}

export const activeRules: RuleConfig = {
    kdvOrani: 20,
    paraBirimi: "TRY",
    fiyatAgirligi: 0.8,
    teslimSuresiAgirligi: 0.05,
    gecTeslimatAgirligi: 0.05,
    garantiAgirligi: 0.05,
    surdurulebilirlikAgirligi: 0.05,
};