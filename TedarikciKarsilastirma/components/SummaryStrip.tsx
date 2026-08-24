import * as React from "react";

export interface ISummaryItem {
    label: string;
    value: string;
    /** Değerin yanında ince bir ayrıntı — kaynak, tedarikçi adı vb. */
    meta?: string | null;
}

export interface ISummaryStripProps {
    items: ISummaryItem[];
}

/**
 * Başlığın hemen altındaki tek satırlık bilgi bandı — kullanıcı karara
 * geçmeden önce bakması gereken sayıları kartlara inmeden verir.
 */
export const SummaryStrip: React.FC<ISummaryStripProps> = ({ items }) => (
    <div className="nek-tk-strip">
        {items.map((item) => (
            <div key={item.label} className="nek-tk-strip__item">
                <span className="nek-tk-label">{item.label}</span>
                <span className="nek-tk-strip__value">
                    {item.value}
                    {item.meta && <span className="nek-tk-strip__meta"> · {item.meta}</span>}
                </span>
            </div>
        ))}
    </div>
);
