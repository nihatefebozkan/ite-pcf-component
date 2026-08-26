import * as React from "react";
import { ZamanCizelgesiAdimi } from "../types";
import { cx } from "./theme";

export interface IZamanCizelgesiProps {
    adimlar: ZamanCizelgesiAdimi[];
}

/**
 * Talebin nerede olduğunu gösteren dikey çizelge. Mevcut adıma kadar olanlar
 * dolu, sonrası soluk — çalışan tek bakışta "sıradaki ne" sorusunu cevaplasın.
 */
export const ZamanCizelgesi: React.FC<IZamanCizelgesiProps> = ({ adimlar }) => (
    <ol className="ctp-cizelge">
        {adimlar.map((adim) => (
            <li key={adim.etiket} className={cx("ctp-adim", `ctp-adim--${adim.durum}`)}>
                <span className="ctp-adim__isaret" aria-hidden="true">
                    <span className="ctp-adim__nokta" />
                    <span className="ctp-adim__cizgi" />
                </span>
                <span className="ctp-adim__etiket">{adim.etiket}</span>
            </li>
        ))}
    </ol>
);
