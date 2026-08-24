/**
 * İŞ KURALLARI — OTOMATİK ÜRETİLEN DOSYA
 *
 * Bu dosyayı Copilot Studio ajanı Power Automate üzerinden BÜTÜNÜYLE değiştirir.
 * Bu yüzden burada yalnızca veri bulunur; fonksiyon, import, koşul veya türetilmiş
 * değer EKLEMEYİN — bir sonraki yayında silinir.
 *
 * Doğrulama, normalleştirme ve hatalı değerlere karşı korunma
 * services/rules.ts içindedir (insan tarafından yönetilir).
 *
 * Ağırlıklar 0-1 aralığındadır ve TOPLAMI 1.0 OLMALIDIR.
 * Toplam 1.0 değilse ekran çökmez: rules.ts oranları koruyarak normalleştirir
 * ve kullanıcıya görünür bir uyarı gösterir.
 */

export interface RuleConfig {
    /** KDV yüzdesi (0-100). Kartlarda KDV dahil fiyatı hesaplamak için. */
    kdvOrani: number;
    /** ISO 4217 para birimi kodu. Manifestteki paraBirimi doluysa o öncelikli. */
    paraBirimi: string;

    /** Düşük fiyat iyidir. */
    fiyatAgirligi: number;
    /** Kısa teslim süresi iyidir. */
    teslimSuresiAgirligi: number;
    /** Düşük geç teslimat oranı iyidir. */
    gecTeslimatAgirligi: number;
    /** Uzun garanti iyidir. */
    garantiAgirligi: number;
    /** Yüksek sürdürülebilirlik puanı iyidir. */
    surdurulebilirlikAgirligi: number;
}

export const activeRules: RuleConfig = {
    kdvOrani: 20,
    paraBirimi: "TRY",

    fiyatAgirligi: 0.4,
    teslimSuresiAgirligi: 0.2,
    gecTeslimatAgirligi: 0.1,
    garantiAgirligi: 0.2,
    surdurulebilirlikAgirligi: 0.1,
};
