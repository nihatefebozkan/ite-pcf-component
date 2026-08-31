import * as React from "react";
import { Bulgu, Grup, TalepOzeti } from "../types";
import { talepOzetleriGetir } from "../services/talepOzetleri";
import { cx, grupla, guvenliLink, paraFormatla } from "./theme";

export interface IPiyasaPaneliProps {
    bulgular: Bulgu[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

const BulguSatiri: React.FC<{ bulgu: Bulgu; enUcuz: number | null }> = ({ bulgu, enUcuz }) => {
    const link = guvenliLink(bulgu.link);
    const ucuz = enUcuz !== null && bulgu.fiyat === enUcuz;
    const kaynak = bulgu.kaynakSite ?? "Bilinmeyen kaynak";

    return (
        <div className={cx("pap-satir", ucuz && "pap-satir--ucuz")}>
            <div className="pap-satir__ust">
                {link ? (
                    <a
                        className="pap-satir__kaynak"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {kaynak} ↗
                    </a>
                ) : (
                    <span className="pap-satir__kaynak pap-satir__kaynak--duz">{kaynak}</span>
                )}
                <span className="pap-satir__fiyat">{paraFormatla(bulgu.fiyat)}</span>
            </div>

            {bulgu.urunAdi && <p className="pap-satir__urun">{bulgu.urunAdi}</p>}

            {bulgu.not && (
                <p className="pap-satir__not">
                    <span className="pap-satir__not-isaret">↳</span>
                    {bulgu.not}
                </p>
            )}

            {ucuz && <span className="pap-rozet pap-tone--yesil">En ucuz</span>}
            {!link && bulgu.link && (
                <span className="pap-rozet pap-tone--amber">Link açılamıyor</span>
            )}
        </div>
    );
};

const GrupKarti: React.FC<{ grup: Grup }> = ({ grup }) => (
    <div className={cx("pap-grup", grup.talepId === null && "pap-grup--bagsiz")}>
        <div className="pap-grup__baslik">
            <p className="pap-grup__talep">{grup.baslik}</p>
            <div className="pap-grup__sag">
                {grup.urunTipi && <span className="pap-rozet pap-tone--gri">{grup.urunTipi}</span>}
                <span className="pap-grup__sayi">{grup.bulgular.length} kayıt</span>
            </div>
        </div>

        {grup.bulgular.map((bulgu) => (
            <BulguSatiri key={bulgu.id} bulgu={bulgu} enUcuz={grup.enUcuz} />
        ))}
    </div>
);

export const PiyasaPaneliRoot: React.FC<IPiyasaPaneliProps> = (props) => {
    const {
        bulgular,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [ozetler, setOzetler] = React.useState<Map<string, TalepOzeti>>(new Map());

    const talepIdAnahtari = bulgular
        .map((b) => b.talepId)
        .filter((id): id is string => id !== null)
        .join(",");

    React.useEffect(() => {
        if (talepIdAnahtari.length === 0) {
            setOzetler(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await talepOzetleriGetir(webAPI, talepIdAnahtari.split(","));
            if (!iptal) setOzetler(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, talepIdAnahtari]);

    const gruplar = React.useMemo(() => grupla(bulgular, ozetler), [bulgular, ozetler]);
    const bagsizSayisi = React.useMemo(
        () => bulgular.filter((b) => b.talepId === null).length,
        [bulgular]
    );

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("pap", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "pap--dar");

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="pap__bar">
                <div>
                    <h2 className="pap__baslik">Piyasa Araştırmaları</h2>
                    <p className="pap__ozet">
                        <strong>{bulgular.length}</strong> kayıt ·{" "}
                        <strong>{gruplar.filter((g) => g.talepId !== null).length}</strong> talep
                    </p>
                </div>

                <button
                    type="button"
                    className="pap-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            {bagsizSayisi > 0 && (
                <p className="pap-bildirim pap-bildirim--uyari" role="status">
                    <strong>{bagsizSayisi} kayıt hiçbir talebe bağlı değil.</strong> Bunlar
                    karşılaştırma ekranında görünmez — AI eşleştirmeyi yapamamış olabilir.
                </p>
            )}

            {eksikSutunlar.length > 0 && (
                <p className="pap-bildirim pap-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok: {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="pap-bildirim pap-bildirim--hata" role="status">
                    Araştırmalar yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && bulgular.length === 0 ? (
                <div className="pap-merkez">
                    <span className="pap-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="pap-merkez__metin">Araştırmalar yükleniyor…</p>
                </div>
            ) : gruplar.length === 0 ? (
                <div className="pap-bos">
                    <span className="pap-bos__baslik">Henüz piyasa araştırması yok</span>
                    <span className="pap-bos__metin">
                        AI bir talep için fiyat bulduğunda burada görünecek.
                    </span>
                </div>
            ) : (
                <div className="pap-gruplar">
                    {gruplar.map((grup) => (
                        <GrupKarti key={grup.talepId ?? "bagsiz"} grup={grup} />
                    ))}
                </div>
            )}
        </div>
    );
};
