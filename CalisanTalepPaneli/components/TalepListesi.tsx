import * as React from "react";
import { Talep } from "../types";
import { TalepKarti } from "./TalepKarti";

export interface ITalepListesiProps {
    talepler: Talep[];
    onAc: (talepId: string) => void;
    onYeniTalep: () => void;
}

export const TalepListesi: React.FC<ITalepListesiProps> = ({ talepler, onAc, onYeniTalep }) => {
    if (talepler.length === 0) {
        return (
            <div className="ctp-bos">
                <span className="ctp-bos__baslik">Henüz bir talebin yok</span>
                <span className="ctp-bos__metin">
                    İhtiyacın olan ekipmanı kendi cümlelerinle anlat, gerisini sistem hallediyor.
                </span>
                <button type="button" className="ctp-btn ctp-btn--primary" onClick={onYeniTalep}>
                    + Yeni Talep
                </button>
            </div>
        );
    }

    return (
        <div className="ctp-liste">
            {talepler.map((talep) => (
                <TalepKarti key={talep.id} talep={talep} onAc={onAc} />
            ))}
        </div>
    );
};
