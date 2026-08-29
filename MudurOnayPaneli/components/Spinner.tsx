import * as React from "react";

export interface ISpinnerProps {
    kucuk?: boolean;
    label?: string;
}

/** Animasyon CSS'te; burada yalnızca erişilebilirlik kabuğu var. */
export const Spinner: React.FC<ISpinnerProps> = ({ kucuk, label }) => {
    const spinner = (
        <span
            className={kucuk ? "mop-spinner mop-spinner--kucuk" : "mop-spinner"}
            role="progressbar"
            aria-label={label ?? "Yükleniyor"}
        />
    );

    if (!label || kucuk) return spinner;

    return (
        <>
            {spinner}
            <p className="mop-merkez__metin">{label}</p>
        </>
    );
};
