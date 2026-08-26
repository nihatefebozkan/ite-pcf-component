import * as React from "react";
import { Talep } from "../types";
import { durumTonu } from "../services/durum";
import { cx, ilkSatir, tarihFormatla, isleniyorMu } from "./theme";

export interface ITalepKartiProps {
    talep: Talep;
    onAc: (talepId: string) => void;
}

export const TalepKarti: React.FC<ITalepKartiProps> = ({ talep, onAc }) => {
    const handleClick = React.useCallback(() => onAc(talep.id), [onAc, talep.id]);
    const isleniyor = isleniyorMu(talep.urunTipi, talep.olusturulma);

    return (
        <button type="button" className="ctp-kart" onClick={handleClick}>
            <div className="ctp-kart__ust">
                <p className="ctp-kart__ozet">{ilkSatir(talep.metin)}</p>
                {talep.durum && (
                    <span className={cx("ctp-rozet", durumTonu(talep.durumDegeri))}>
                        {talep.durum}
                    </span>
                )}
            </div>

            <div className="ctp-kart__alt">
                {talep.urunTipi && <span className="ctp-etiket">{talep.urunTipi}</span>}
                {isleniyor && <span className="ctp-isleniyor">İşleniyor…</span>}
                {talep.oncelik && <span className="ctp-etiket">{talep.oncelik}</span>}
                <span className="ctp-kart__tarih">{tarihFormatla(talep.olusturulma)}</span>
            </div>
        </button>
    );
};
