export interface RuleConfig {
  kdvOrani: number;
  fiyatSkorAgirligi: number; // örn: %40
  teslimatSkorAgirligi: number; // örn: %30
  garantiSkorAgirligi: number; // örn: %30
  paraBirimi: string;
}

export const activeRules: RuleConfig = {
  kdvOrani: 20,
  fiyatSkorAgirligi: 0.4,
  teslimatSkorAgirligi: 0.3,
  garantiSkorAgirligi: 0.3,
  paraBirimi: "TRY"
};