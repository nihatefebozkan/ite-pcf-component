import * as React from "react";
import { Tedarikci } from "../types";
import { cx, gecTeslimatTonu, paraFormatla, sayiFormatla } from "./theme";

export interface ITedarikciKartiProps {
    tedarikci: Tedarikci;
    onAc: (id: string) => void;
}

interface IMetrikProps {
    etiket: string;
    deger: string;
}

const Metrik: React.FC<IMetrikProps> = ({ etiket, deger }) => (
    <div className="tdp-metrik">
        <span className="tdp-metrik__etiket">{etiket}</span>
        <span className="tdp-metrik__deger">{deger}</span>
    </div>
);

export const TedarikciKarti: React.FC<ITedarikciKartiProps> = ({ tedarikci, onAc }) => {
    const epostasiz = !tedarikci.email;

    return (
        <button
            type="button"
            className={cx("tdp-kart", epostasiz && "tdp-kart--epostasiz")}
            onClick={() => onAc(tedarikci.id)}
            title="Kaydı yeni sekmede aç"
        >
            <div className="tdp-kart__ust">
                <div className="tdp-kart__baslik-blok">
                    <h3 className="tdp-kart__ad">
                        {tedarikci.urunKategorisi ?? tedarikci.ad}
                    </h3>
                    <div className="tdp-kart__rozetler">
                        {tedarikci.anlasmali && (
                            <span className="tdp-rozet tdp-rozet--anlasmali">✓ Anlaşmalı</span>
                        )}
                    </div>
                </div>
                <span className="tdp-kart__fiyat">{paraFormatla(tedarikci.fiyat)}</span>
            </div>

            {epostasiz ? (
                <div className="tdp-eposta tdp-eposta--eksik">
                    <span className="tdp-eposta__baslik">E-posta adresi yok</span>
                    <span className="tdp-eposta__aciklama">
                        Bu tedarikçi seçilirse sipariş e-postası gönderilemez. Adresi ekleyin.
                    </span>
                </div>
            ) : (
                <span className="tdp-eposta">{tedarikci.email}</span>
            )}

            <div className="tdp-metrikler">
                <Metrik
                    etiket="Teslim"
                    deger={sayiFormatla(tedarikci.teslimSuresi, " gün")}
                />
                <div className="tdp-metrik">
                    <span className="tdp-metrik__etiket">Geç teslimat</span>
                    <span
                        className={cx(
                            "tdp-metrik__deger",
                            "tdp-rozet",
                            gecTeslimatTonu(tedarikci.gecTeslimatOrani)
                        )}
                    >
                        {sayiFormatla(tedarikci.gecTeslimatOrani, "%")}
                    </span>
                </div>
                <Metrik etiket="Garanti" deger={sayiFormatla(tedarikci.garantiSuresi, " ay")} />
                <Metrik
                    etiket="Sürdürülebilirlik"
                    deger={sayiFormatla(tedarikci.surdurulebilirlikPuani, "/100")}
                />
                <Metrik
                    etiket="Geçmiş sipariş"
                    deger={sayiFormatla(tedarikci.gecmisSiparisSayisi)}
                />
            </div>
        </button>
    );
};
