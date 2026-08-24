import * as React from "react";
import { ScoredSupplier } from "../types";
import { cx, scoreTone, delayTone, formatCurrency, formatNumber } from "./theme";
import { withVat } from "../services/rules";
import { Spinner } from "./Spinner";

export interface ISupplierCardProps {
    supplier: ScoredSupplier;
    /** Kümenin en yüksek skorlusu mu — kart hiyerarşisini bu belirler. */
    isRecommended: boolean;
    /** Siparişte hâlihazırda seçili olan tedarikçi mi. */
    isSelected: boolean;
    /** Bu kart için seçim isteği uçuşta mı. */
    isBusy: boolean;
    /** Seçim butonu tümüyle devre dışı mı (salt okunur form, talep bağlamı yok vb.). */
    disabled: boolean;
    currency: string;
    /** KDV yüzdesi — fiyatın altında KDV dahil karşılığını göstermek için. */
    kdvOrani: number;
    onSelect: (supplier: ScoredSupplier) => void;
}

interface IMetricProps {
    label: string;
    value: string;
    toneClass?: string;
}

const Metric: React.FC<IMetricProps> = ({ label, value, toneClass }) => (
    <div className="nek-tk-metric">
        <span className="nek-tk-label">{label}</span>
        <span className={cx("nek-tk-metric__value", toneClass)}>{value}</span>
    </div>
);

export const SupplierCard: React.FC<ISupplierCardProps> = (props) => {
    const { supplier, isRecommended, isSelected, isBusy, disabled, currency, kdvOrani, onSelect } = props;
    const tone = scoreTone(supplier.score);
    const grossPrice = withVat(supplier.fiyat, kdvOrani);

    const handleSelect = React.useCallback(() => onSelect(supplier), [onSelect, supplier]);

    return (
        <div className="nek-tk-card-wrap">
            {isRecommended && <span className="nek-tk-card__tab">✓ Önerilen</span>}

            <div
                className={cx(
                    "nek-tk-card",
                    isRecommended && "nek-tk-card--recommended",
                    isSelected && "nek-tk-card--selected"
                )}
            >
                <div className="nek-tk-card__header">
                    <div className="nek-tk-card__heading">
                        <h3 className="nek-tk-card__name">{supplier.ad}</h3>
                        {supplier.urunKategorisi && (
                            <span className="nek-tk-card__category">{supplier.urunKategorisi}</span>
                        )}
                    </div>

                    <div
                        className={cx(
                            "nek-tk-score",
                            isRecommended ? "nek-tk-score--bare" : "nek-tk-score--ring",
                            tone.className
                        )}
                        title={`Skor ${supplier.score}/100 — ${tone.label}`}
                    >
                        <span className="nek-tk-score__value">{supplier.score}</span>
                        <span className="nek-tk-score__label">Skor</span>
                    </div>
                </div>

                <div className="nek-tk-card__price-row">
                    <span className="nek-tk-card__price">{formatCurrency(supplier.fiyat, currency)}</span>
                    {grossPrice !== null && (
                        <span className="nek-tk-card__lead">
                            KDV dahil {formatCurrency(grossPrice, currency)}
                        </span>
                    )}
                    {supplier.teslimSuresi !== null && (
                        <span className="nek-tk-card__lead">
                            ⏱ {formatNumber(supplier.teslimSuresi, " gün")} teslim
                        </span>
                    )}
                </div>

                <p className="nek-tk-card__rationale">{supplier.rationale}</p>

                {(supplier.anlasmaliTedarikci === true || isSelected) && (
                    <div className="nek-tk-card__badges">
                        {supplier.anlasmaliTedarikci === true && (
                            <span className="nek-tk-chip nek-tk-chip--contracted">✓ Anlaşmalı</span>
                        )}
                        {isSelected && (
                            <span className="nek-tk-chip nek-tk-chip--selected">Siparişte seçili</span>
                        )}
                    </div>
                )}

                <div className="nek-tk-card__metrics">
                    <Metric
                        label="Geç teslimat"
                        value={formatNumber(supplier.gecTeslimatOrani, "%")}
                        toneClass={delayTone(supplier.gecTeslimatOrani)}
                    />
                    <Metric label="Garanti" value={formatNumber(supplier.garantiSuresi, " ay")} />
                    <Metric
                        label="Sürdürülebilirlik"
                        value={formatNumber(supplier.surdurulebilirlikPuani, "/100")}
                    />
                </div>

                <button
                    type="button"
                    className={cx(
                        "nek-tk-btn",
                        "nek-tk-btn--block",
                        isSelected
                            ? "nek-tk-btn--selected"
                            : isRecommended
                              ? "nek-tk-btn--primary"
                              : "nek-tk-btn--outline"
                    )}
                    disabled={disabled || isBusy}
                    onClick={handleSelect}
                >
                    {isBusy && <Spinner tiny />}
                    {isSelected ? "Seçili tedarikçi" : isBusy ? "Kaydediliyor…" : "Bu tedarikçiyi seç"}
                </button>
            </div>
        </div>
    );
};
