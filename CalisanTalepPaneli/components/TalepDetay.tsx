import * as React from "react";
import { Talep } from "../types";
import { durumKonumu, durumTonu, zamanCizelgesi } from "../services/durum";
import { redGerekcesiGetir } from "../services/talepService";
import { ZamanCizelgesi } from "./ZamanCizelgesi";
import { cx, tarihSaatFormatla } from "./theme";

export interface ITalepDetayProps {
    talep: Talep;
    webAPI: ComponentFramework.WebApi;
    onGeri: () => void;
}

export const TalepDetay: React.FC<ITalepDetayProps> = ({ talep, webAPI, onGeri }) => {
    const [gerekce, setGerekce] = React.useState<string | null>(null);
    const { reddedildi } = durumKonumu(talep.durumDegeri);

    React.useEffect(() => {
        // Gerekçe yalnızca reddedilmiş taleplerde anlamlı; diğerlerinde
        // gereksiz bir sorgu atmıyoruz.
        if (!reddedildi) {
            setGerekce(null);
            return;
        }

        let iptal = false;

        async function yukle(): Promise<void> {
            const metin = await redGerekcesiGetir(webAPI, talep.id);
            if (!iptal) setGerekce(metin);
        }

        void yukle();

        return () => {
            iptal = true;
        };
    }, [webAPI, talep.id, reddedildi]);

    const adimlar = React.useMemo(() => zamanCizelgesi(talep.durumDegeri), [talep.durumDegeri]);

    return (
        <div className="ctp-detay">
            <button type="button" className="ctp-geri" onClick={onGeri}>
                ← Taleplerime dön
            </button>

            <div className="ctp-panel">
                <span className="ctp-panel__baslik">Talebin</span>
                <p className="ctp-detay__metin">{talep.metin ?? "(açıklama girilmemiş)"}</p>

                <div className="ctp-detay__satir">
                    {talep.urunTipi ? (
                        <span className="ctp-etiket">{talep.urunTipi}</span>
                    ) : (
                        <span className="ctp-isleniyor">Kategori belirleniyor…</span>
                    )}
                    {talep.oncelik && <span className="ctp-etiket">{talep.oncelik}</span>}
                    {talep.durum && (
                        <span className={cx("ctp-rozet", durumTonu(talep.durumDegeri))}>
                            {talep.durum}
                        </span>
                    )}
                </div>

                <span className="ctp-alan__yardim">
                    Oluşturulma: {tarihSaatFormatla(talep.olusturulma)}
                </span>
            </div>

            {reddedildi && gerekce && (
                <div className="ctp-gerekce">
                    <span className="ctp-gerekce__baslik">Reddedilme gerekçesi</span>
                    <p className="ctp-gerekce__metin">{gerekce}</p>
                </div>
            )}

            <div className="ctp-panel">
                <span className="ctp-panel__baslik">Nerede</span>
                <ZamanCizelgesi adimlar={adimlar} />
            </div>
        </div>
    );
};
