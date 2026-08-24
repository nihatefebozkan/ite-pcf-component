import * as React from "react";

export interface ISpinnerProps {
    /** Buton içi kullanım için küçük boy. */
    tiny?: boolean;
    /** Dönenin yanında/altında gösterilecek metin. */
    label?: string;
}

/**
 * Fluent'in Spinner'ı yerine geçen minimal karşılık — animasyon tamamen
 * CSS'te (`.nek-tk-spinner`), burada yalnızca erişilebilirlik kabuğu var.
 */
export const Spinner: React.FC<ISpinnerProps> = ({ tiny, label }) => {
    const spinner = (
        <span
            className={tiny ? "nek-tk-spinner nek-tk-spinner--tiny" : "nek-tk-spinner"}
            role="progressbar"
            aria-label={label ?? "Yükleniyor"}
        />
    );

    if (!label || tiny) return spinner;

    return (
        <>
            {spinner}
            <p className="nek-tk-centered__text">{label}</p>
        </>
    );
};
