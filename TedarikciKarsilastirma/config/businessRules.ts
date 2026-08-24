// OTOMATIK URETILILEN DOSYA - Copilot Studio bu dosyayi butunuyle degistirir.
// Fonksiyon, import veya kosul EKLEMEYIN; dogrulama services/rules.ts icindedir.
// ISTEK: 
// URETIM: Copilot Studio · 
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
    fiyatAgirligi: 0.5,
    teslimSuresiAgirligi: 0.2,
    gecTeslimatAgirligi: 0.1,
    garantiAgirligi: 0.1,
    surdurulebilirlikAgirligi: 0.1,
};