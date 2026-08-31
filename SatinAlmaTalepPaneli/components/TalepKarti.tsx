import * as React from "react";
import { Talep } from "../types";
import { cx, gunFarki, ilkSatir, oncelikTonu, tarihFormatla, BEKLEME_ESIGI_GUN } from "./theme";

export interface ITalepKartiProps {
    talep: Talep;
    /** Bu talebe bağlı piyasa araştırması sayısı; bilinmiyorsa null. */
    piyasaSayisi: number | null;
    onAc: (talepId: string) => void;
}

export const TalepKarti: React.FC<ITalepKartiProps> = ({ talep, piyasaSayisi, onAc }) => {
    const handleClick = React.useCallback(() => onAc(talep.id), [onAc, talep.id]);

    const gun = gunFarki(talep.olusturulma);
    const bekliyor = gun !== null && gun > BEKLEME_ESIGI_GUN;
    const arastirmasiz = piyasaSayisi === 0;

    return (
        <button
            type="button"
            className={cx("sap-kart", arastirmasiz && "sap-kart--arastirmasiz")}
            onClick={handleClick}
        >
            <div className="sap-kart__ust">
                <p className="sap-kart__ozet">{ilkSatir(talep.metin)}</p>
                {talep.oncelik && (
                    <span className={cx("sap-rozet", oncelikTonu(talep.oncelik))}>
                        {talep.oncelik}
                    </span>
                )}
            </div>

            {arastirmasiz && (
                <span className="sap-uyari">
                    Piyasa araştırması yok — karşılaştırma ekranının sağ tarafı boş gelecek.
                </span>
            )}

            <div className="sap-kart__alt">
                {talep.calisan && <span className="sap-kart__calisan">{talep.calisan}</span>}
                {talep.urunTipi && <span className="sap-etiket">{talep.urunTipi}</span>}
                {piyasaSayisi !== null && piyasaSayisi > 0 && (
                    <span className="sap-etiket">{piyasaSayisi} piyasa kaydı</span>
                )}
                {bekliyor && (
                    <span className="sap-rozet sap-tone--amber">{gun} gündür bekliyor</span>
                )}
                <span className="sap-kart__tarih">{tarihFormatla(talep.olusturulma)}</span>
            </div>
        </button>
    );
};
