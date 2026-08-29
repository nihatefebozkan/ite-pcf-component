import * as React from "react";
import { Talep } from "../types";
import { cx, ilkSatir, oncelikTonu, tarihFormatla, bekleyenGun } from "./theme";

export interface ITalepKartiProps {
    talep: Talep;
    onAc: (talepId: string) => void;
}

/** Bu günden sonra bekleyen talep vurgulanır — hedef yanıt süresi 24 saat. */
const GECIKME_ESIGI_GUN = 1;

export const TalepKarti: React.FC<ITalepKartiProps> = ({ talep, onAc }) => {
    const handleClick = React.useCallback(() => onAc(talep.id), [onAc, talep.id]);
    const gun = bekleyenGun(talep.olusturulma);
    const gecikmis = gun !== null && gun > GECIKME_ESIGI_GUN;

    return (
        <button type="button" className="mop-kart" onClick={handleClick}>
            <div className="mop-kart__ust">
                <p className="mop-kart__ozet">{ilkSatir(talep.metin)}</p>
                {talep.oncelik && (
                    <span className={cx("mop-rozet", oncelikTonu(talep.oncelik))}>
                        {talep.oncelik}
                    </span>
                )}
            </div>

            <div className="mop-kart__alt">
                {talep.calisan && <span className="mop-kart__calisan">{talep.calisan}</span>}
                {talep.urunTipi && <span className="mop-etiket">{talep.urunTipi}</span>}
                {gecikmis && (
                    <span className="mop-rozet mop-tone--amber">{gun} gündür bekliyor</span>
                )}
                <span className="mop-kart__tarih">{tarihFormatla(talep.olusturulma)}</span>
            </div>
        </button>
    );
};
