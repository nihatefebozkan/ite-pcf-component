import * as React from "react";
import { Gorunum, Karar, Talep } from "../types";
import { kararVer } from "../services/onayService";
import { TalepKarti } from "./TalepKarti";
import { OnayDetay } from "./OnayDetay";
import { Spinner } from "./Spinner";
import { cx } from "./theme";

export interface IOnayPaneliProps {
    talepler: Talep[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

/** Bu genişliğin altında karar butonları alt alta geçer. */
const DAR_ESIK = 720;

/**
 * Karardan sonra Onaylar.Durum değişimini dinleyen akış Talepler.Durum'u
 * güncelliyor ve talep bu görünümden düşüyor. Akışın tamamlanması için bir
 * süre bekleyip listeyi tazeliyoruz.
 */
const AKIS_BEKLEME_MS = 3000;

export const OnayPaneli: React.FC<IOnayPaneliProps> = (props) => {
    const {
        talepler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [gorunum, setGorunum] = React.useState<Gorunum>({ tip: "liste" });
    const [bildirim, setBildirim] = React.useState<string | null>(null);

    const zamanlayici = React.useRef<number | null>(null);

    React.useEffect(
        () => () => {
            if (zamanlayici.current !== null) window.clearTimeout(zamanlayici.current);
        },
        []
    );

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};

    const rootClass = cx("mop", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "mop--dar");

    const acikTalep =
        gorunum.tip === "detay" ? talepler.find((t) => t.id === gorunum.talepId) ?? null : null;

    const handleKarar = React.useCallback(
        async (karar: Karar, aciklama: string): Promise<void> => {
            if (gorunum.tip !== "detay") return;

            const talep = talepler.find((t) => t.id === gorunum.talepId);
            await kararVer(webAPI, gorunum.talepId, karar, aciklama);

            const kim = talep?.calisan ? ` (${talep.calisan})` : "";
            setBildirim(
                karar === "onayla"
                    ? `Talep onaylandı${kim}. Satın almaya iletildi.`
                    : `Talep reddedildi${kim}. Gerekçe çalışana iletildi.`
            );
            setGorunum({ tip: "liste" });

            onRefresh();
            if (zamanlayici.current !== null) window.clearTimeout(zamanlayici.current);
            zamanlayici.current = window.setTimeout(() => {
                zamanlayici.current = null;
                onRefresh();
            }, AKIS_BEKLEME_MS);
        },
        [gorunum, talepler, webAPI, onRefresh]
    );

    // Karardan sonra kayıt görünümden düşünce detayda boş ekranda kalmayalım.
    React.useEffect(() => {
        if (gorunum.tip === "detay" && !yukleniyor && acikTalep === null) {
            setGorunum({ tip: "liste" });
        }
    }, [gorunum, yukleniyor, acikTalep]);

    if (gorunum.tip === "detay" && acikTalep) {
        return (
            <div className={rootClass} style={rootStyle}>
                <OnayDetay
                    talep={acikTalep}
                    onKarar={handleKarar}
                    onGeri={() => setGorunum({ tip: "liste" })}
                />
            </div>
        );
    }

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="mop__bar">
                <div className="mop__baslik-blok">
                    <h2 className="mop__baslik">Onayımı Bekleyenler</h2>
                    <p className="mop__alt-baslik">
                        {talepler.length === 0 ? (
                            "Bekleyen talep yok."
                        ) : (
                            <>
                                <span className="mop__sayac">{talepler.length}</span> talep kararını
                                bekliyor. Hedef yanıt süresi 24 saat.
                            </>
                        )}
                    </p>
                </div>

                <div className="mop__eylemler">
                    <button
                        type="button"
                        className="mop-btn mop-btn--sade mop-btn--ikon"
                        onClick={() => {
                            setBildirim(null);
                            onRefresh();
                        }}
                        title="Yenile"
                        aria-label="Listeyi yenile"
                    >
                        ⟳
                    </button>
                </div>
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="mop-bildirim mop-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, bu yüzden kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}. Görünümü düzenleyip bu sütunları ekleyin.
                </p>
            )}

            {bildirim && (
                <p className="mop-bildirim mop-bildirim--basari" role="status">
                    {bildirim}
                </p>
            )}

            {datasetHatasi ? (
                <p className="mop-bildirim mop-bildirim--hata" role="status">
                    Talepler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && talepler.length === 0 ? (
                <div className="mop-merkez">
                    <Spinner label="Bekleyen talepler yükleniyor…" />
                </div>
            ) : talepler.length === 0 ? (
                <div className="mop-bos">
                    <span className="mop-bos__baslik">Kararını bekleyen talep yok</span>
                    <span className="mop-bos__metin">
                        Ekibinden yeni bir talep geldiğinde burada görünecek.
                    </span>
                </div>
            ) : (
                <div className="mop-liste">
                    {talepler.map((talep) => (
                        <TalepKarti
                            key={talep.id}
                            talep={talep}
                            onAc={(talepId) => {
                                setBildirim(null);
                                setGorunum({ tip: "detay", talepId });
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
