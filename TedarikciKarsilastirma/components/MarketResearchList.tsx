import * as React from "react";
import { MarketFinding } from "../types";
import { cx, formatCurrency } from "./theme";

export interface IMarketResearchListProps {
    findings: MarketFinding[];
    currency: string;
    /** Karşılaştırma için en iyi iç tedarikçi fiyatı; verilirse fark rozeti gösterilir. */
    bestInternalPrice: number | null;
    /** Panelin altındaki değerlendirme metni; yoksa blok çizilmez. */
    conclusion: string | null;
}

/** İç tedarikçi fiyatına göre farkı rozet metnine ve sınıfına çevirir. */
function priceDelta(
    marketPrice: number | null,
    bestInternalPrice: number | null
): { text: string; className: string } | null {
    if (marketPrice === null || bestInternalPrice === null || bestInternalPrice === 0) return null;

    const pct = Math.round(((marketPrice - bestInternalPrice) / bestInternalPrice) * 100);
    if (pct === 0) return { text: "İç teklifle aynı", className: "nek-tk-market__delta--same" };
    if (pct > 0) {
        return { text: `İç tekliften %${pct} pahalı`, className: "nek-tk-market__delta--pricey" };
    }
    return {
        text: `İç tekliften %${Math.abs(pct)} ucuz`,
        className: "nek-tk-market__delta--cheap",
    };
}

/** Sadece http/https bağlantılarına izin verir — javascript: gibi şemaları eler. */
function safeHref(url: string | null): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
    } catch {
        return null;
    }
}

export const MarketResearchList: React.FC<IMarketResearchListProps> = ({
    findings,
    currency,
    bestInternalPrice,
    conclusion,
}) => {
    if (findings.length === 0) {
        return (
            <div className="nek-tk-market">
                <p className="nek-tk-empty">
                    Bu talep için henüz piyasa araştırması kaydı girilmemiş.
                </p>
            </div>
        );
    }

    const prices = findings.map((f) => f.bulunanFiyat).filter((p): p is number => p !== null);
    const cheapest = prices.length > 0 ? Math.min(...prices) : null;

    return (
        <div className="nek-tk-market">
            {findings.map((finding) => {
                const href = safeHref(finding.urunLinki);
                const delta = priceDelta(finding.bulunanFiyat, bestInternalPrice);
                const isCheapest = cheapest !== null && finding.bulunanFiyat === cheapest;
                const sourceLabel = finding.kaynakSite ?? "Bilinmeyen kaynak";

                return (
                    <div
                        key={finding.id}
                        className={cx(
                            "nek-tk-market__row",
                            isCheapest && "nek-tk-market__row--cheapest"
                        )}
                    >
                        <div className="nek-tk-market__top">
                            {href ? (
                                <a
                                    className="nek-tk-market__source"
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {sourceLabel} ↗
                                </a>
                            ) : (
                                <span className="nek-tk-market__source nek-tk-market__source--plain">
                                    {sourceLabel}
                                </span>
                            )}
                            <span className="nek-tk-market__price">
                                {formatCurrency(finding.bulunanFiyat, currency)}
                            </span>
                        </div>

                        {finding.urunAdi && (
                            <p className="nek-tk-market__product">{finding.urunAdi}</p>
                        )}

                        {finding.karsilastirmaNotu && (
                            <p className="nek-tk-market__note">
                                <span className="nek-tk-market__note-mark">↳</span>
                                {finding.karsilastirmaNotu}
                            </p>
                        )}

                        {delta && (
                            <span className={cx("nek-tk-market__delta", delta.className)}>
                                {delta.text}
                            </span>
                        )}
                    </div>
                );
            })}

            {conclusion && (
                <p className="nek-tk-market__conclusion">
                    <span className="nek-tk-market__conclusion-label">Değerlendirme: </span>
                    {conclusion}
                </p>
            )}
        </div>
    );
};
