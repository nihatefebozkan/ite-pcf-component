import * as React from "react";

export interface ISpinnerProps {
    /** Buton içi kullanım için küçük boy. */
    kucuk?: boolean;
    label?: string;
}

/** Animasyon tamamen CSS'te; burada yalnızca erişilebilirlik kabuğu var. */
export const Spinner: React.FC<ISpinnerProps> = ({ kucuk, label }) => {
    const spinner = (
        <span
            className={kucuk ? "ctp-spinner ctp-spinner--kucuk" : "ctp-spinner"}
            role="progressbar"
            aria-label={label ?? "Yükleniyor"}
        />
    );

    if (!label || kucuk) return spinner;

    return (
        <>
            {spinner}
            <p className="ctp-merkez__metin">{label}</p>
        </>
    );
};
