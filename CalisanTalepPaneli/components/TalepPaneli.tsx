import * as React from "react";
import { Gorunum, OncelikSeviyesi, Talep } from "../types";
import { talepOlustur } from "../services/talepService";
import { TalepListesi } from "./TalepListesi";
import { TalepDetay } from "./TalepDetay";
import { YeniTalepFormu } from "./YeniTalepFormu";
import { Spinner } from "./Spinner";
import { cx } from "./theme";

export interface ITalepPaneliProps {
    talepler: Talep[];
    yukleniyor: boolean;
    /** Dataset okuma hatası; varsa liste yerine gösterilir. */
    datasetHatasi: string | null;
    /** Görünümde eksik olan sütunlar — uyarı olarak gösterilir. */
    eksikSutunlar: string[];
    /** Talepler tablosunun logical name'i (dataset'ten geliyor). */
    entityName: string;
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    /** Dataset'i yeniden çeker. */
    onRefresh: () => void;
}

/** Bu genişliğin altında öncelik kartları alt alta geçer. */
const DAR_ESIK = 720;

/**
 * Kayıt oluşturulduktan sonra arka plan akışları (AI kategori tespiti, onay
 * kaydı, durum güncelleme) birkaç saniye sürüyor. Bu süre sonunda dataset bir
 * kez daha çekilir ki çalışan kategoriyi ve güncel durumu görsün.
 */
const AKIS_BEKLEME_MS = 3000;

export const TalepPaneli: React.FC<ITalepPaneliProps> = (props) => {
    const {
        talepler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        entityName,
        webAPI,
        allocatedWidth,
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

    const handleGonder = React.useCallback(
        async (metin: string, oncelik: OncelikSeviyesi): Promise<void> => {
            await talepOlustur(webAPI, entityName, metin, oncelik);

            setGorunum({ tip: "liste" });
            setBildirim("Talebin oluşturuldu ve müdürüne onaya gönderildi.");

            // Hemen yenile ki kayıt listede görünsün; akışlar tamamlanınca
            // kategori ve durum dolsun diye bir kez daha yenile.
            onRefresh();
            if (zamanlayici.current !== null) window.clearTimeout(zamanlayici.current);
            zamanlayici.current = window.setTimeout(() => {
                zamanlayici.current = null;
                onRefresh();
            }, AKIS_BEKLEME_MS);
        },
        [webAPI, entityName, onRefresh]
    );

    const handleYenile = React.useCallback(() => {
        setBildirim(null);
        onRefresh();
    }, [onRefresh]);

    const rootClass = cx("ctp", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "ctp--dar");

    const acikTalep =
        gorunum.tip === "detay" ? talepler.find((t) => t.id === gorunum.talepId) ?? null : null;

    // Detaydaki kayıt yenileme sonrası listeden düşerse listeye geri dön —
    // aksi halde boş bir detay ekranında sıkışıp kalınır.
    React.useEffect(() => {
        if (gorunum.tip === "detay" && !yukleniyor && acikTalep === null) {
            setGorunum({ tip: "liste" });
        }
    }, [gorunum, yukleniyor, acikTalep]);

    if (gorunum.tip === "yeni") {
        return (
            <div className={rootClass}>
                <div className="ctp__bar">
                    <div className="ctp__baslik-blok">
                        <h2 className="ctp__baslik">Yeni Talep</h2>
                        <p className="ctp__alt-baslik">
                            Müdürün onayladıktan sonra satın alma devralacak.
                        </p>
                    </div>
                </div>

                <YeniTalepFormu
                    onGonder={handleGonder}
                    onGeri={() => setGorunum({ tip: "liste" })}
                />
            </div>
        );
    }

    if (gorunum.tip === "detay" && acikTalep) {
        return (
            <div className={rootClass}>
                <TalepDetay
                    talep={acikTalep}
                    webAPI={webAPI}
                    onGeri={() => setGorunum({ tip: "liste" })}
                />
            </div>
        );
    }

    return (
        <div className={rootClass}>
            <div className="ctp__bar">
                <div className="ctp__baslik-blok">
                    <h2 className="ctp__baslik">Taleplerim</h2>
                    <p className="ctp__alt-baslik">Açtığın talepler ve nerede oldukları.</p>
                </div>

                <div className="ctp__eylemler">
                    <button
                        type="button"
                        className="ctp-btn ctp-btn--sade ctp-btn--ikon"
                        onClick={handleYenile}
                        title="Yenile"
                        aria-label="Listeyi yenile"
                    >
                        ⟳
                    </button>
                    <button
                        type="button"
                        className="ctp-btn ctp-btn--primary"
                        onClick={() => {
                            setBildirim(null);
                            setGorunum({ tip: "yeni" });
                        }}
                    >
                        + Yeni Talep
                    </button>
                </div>
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="ctp-bildirim ctp-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, bu yüzden kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}. Görünümü düzenleyip bu sütunları ekleyin.
                </p>
            )}

            {bildirim && (
                <p className="ctp-bildirim ctp-bildirim--basari" role="status">
                    {bildirim}
                </p>
            )}

            {datasetHatasi ? (
                <p className="ctp-bildirim ctp-bildirim--hata" role="status">
                    Talepler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && talepler.length === 0 ? (
                <div className="ctp-merkez">
                    <Spinner label="Talepler yükleniyor…" />
                </div>
            ) : (
                <TalepListesi
                    talepler={talepler}
                    onAc={(talepId) => setGorunum({ tip: "detay", talepId })}
                    onYeniTalep={() => setGorunum({ tip: "yeni" })}
                />
            )}
        </div>
    );
};
