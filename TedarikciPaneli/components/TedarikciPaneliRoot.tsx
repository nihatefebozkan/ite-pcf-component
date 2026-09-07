import * as React from "react";
import { SiparisKaydi, Suzgec, Tedarikci } from "../types";
import { siparisGecmisiGetir } from "../services/siparisGecmisi";
import { TedarikciKarti } from "./TedarikciKarti";
import { cx, gruplaTedarikciye, paraFormatla, tarihFormatla } from "./theme";

export interface ITedarikciPaneliProps {
    tedarikciler: Tedarikci[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    webAPI: ComponentFramework.WebApi;
    onKayitAc: (id: string) => void;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

export const TedarikciPaneliRoot: React.FC<ITedarikciPaneliProps> = (props) => {
    const {
        tedarikciler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        allocatedWidth,
        allocatedHeight,
        webAPI,
        onKayitAc,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("tumu");
    /** Kullanıcının elle açtığı/kapattığı gruplar; varsayılan davranışı ezer. */
    const [acikGruplar, setAcikGruplar] = React.useState<Record<string, boolean>>({});
    const [siparisHaritasi, setSiparisHaritasi] = React.useState<Map<string, SiparisKaydi[]>>(
        new Map()
    );

    // Bağımlılık dizi kimliği değil id listesinin kendisi olsun diye
    // birleştirilmiş metin kullanılıyor; aksi halde her render sorgu atardı.
    const tedarikciIdAnahtari = tedarikciler.map((t) => t.id).join(",");

    React.useEffect(() => {
        if (tedarikciIdAnahtari.length === 0) {
            setSiparisHaritasi(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await siparisGecmisiGetir(webAPI, tedarikciIdAnahtari.split(","));
            if (!iptal) setSiparisHaritasi(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, tedarikciIdAnahtari]);

    const sayilar = React.useMemo(() => {
        let anlasmali = 0;
        let epostasiz = 0;
        for (const t of tedarikciler) {
            if (t.anlasmali) anlasmali++;
            if (!t.email) epostasiz++;
        }
        return { anlasmali, epostasiz };
    }, [tedarikciler]);

    const gorunenler = React.useMemo(
        () =>
            tedarikciler.filter((t) => {
                if (suzgec === "anlasmali") return t.anlasmali;
                if (suzgec === "epostasiz") return !t.email;
                return true;
            }),
        [tedarikciler, suzgec]
    );

    const gruplar = React.useMemo(
        () => gruplaTedarikciye(gorunenler, siparisHaritasi),
        [gorunenler, siparisHaritasi]
    );

    /**
     * Grup varsayılan olarak kapalı; e-postası eksik satır içerenler açık başlar.
     * Katlanınca gözden kaybolmaması gereken tek grup o.
     */
    const grupAcikMi = React.useCallback(
        (grup: { ad: string; epostasizSayisi: number }): boolean =>
            acikGruplar[grup.ad] ?? grup.epostasizSayisi > 0,
        [acikGruplar]
    );

    const grupDegistir = React.useCallback((grup: { ad: string; epostasizSayisi: number }) => {
        setAcikGruplar((onceki) => ({
            ...onceki,
            [grup.ad]: !(onceki[grup.ad] ?? grup.epostasizSayisi > 0),
        }));
    }, []);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("tdp", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "tdp--dar");

    const suzgecler: { deger: Suzgec; etiket: string; uyari?: boolean }[] = [
        { deger: "tumu", etiket: `Tümü (${tedarikciler.length})` },
        { deger: "anlasmali", etiket: `Anlaşmalı (${sayilar.anlasmali})` },
        { deger: "epostasiz", etiket: `E-postası yok (${sayilar.epostasiz})`, uyari: true },
    ];

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="tdp__bar">
                <div>
                    <h2 className="tdp__baslik">Tedarikçiler</h2>
                    <p className="tdp__ozet">
                        <strong>{tedarikciler.length}</strong> tedarikçi ·{" "}
                        <strong>{sayilar.anlasmali}</strong> anlaşmalı
                    </p>
                </div>

                <button
                    type="button"
                    className="tdp-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            {sayilar.epostasiz > 0 && (
                <p className="tdp-bildirim tdp-bildirim--hata" role="status">
                    <strong>{sayilar.epostasiz} tedarikçinin e-posta adresi yok.</strong> Bunlar
                    seçilirse otomatik sipariş e-postası gönderilemez ve sipariş sessizce askıda
                    kalır.
                </p>
            )}

            <div className="tdp-suzgecler">
                {suzgecler.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx(
                            "tdp-cip",
                            s.uyari && "tdp-cip--uyari",
                            suzgec === s.deger && "tdp-cip--secili"
                        )}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="tdp-bildirim tdp-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="tdp-bildirim tdp-bildirim--hata" role="status">
                    Tedarikçiler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && tedarikciler.length === 0 ? (
                <div className="tdp-merkez">
                    <span className="tdp-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="tdp-merkez__metin">Tedarikçiler yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="tdp-bos">
                    <span className="tdp-bos__baslik">Bu süzgeçte tedarikçi yok</span>
                    <span className="tdp-bos__metin">Başka bir süzgeç deneyebilirsin.</span>
                </div>
            ) : (
                <div className="tdp-gruplar">
                    {gruplar.map((grup) => {
                        const acik = grupAcikMi(grup);
                        return (
                            <div key={grup.ad} className="tdp-grup">
                                <div className="tdp-grup__baslik">
                                    <button
                                        type="button"
                                        className="tdp-grup__ac"
                                        onClick={() => grupDegistir(grup)}
                                        aria-expanded={acik}
                                    >
                                        <span className="tdp-grup__ok" aria-hidden="true">
                                            {acik ? "▾" : "▸"}
                                        </span>
                                        <span className="tdp-grup__bilgi">
                                            <span className="tdp-grup__satir1">
                                                <span className="tdp-grup__ad">{grup.ad}</span>
                                                {grup.anlasmali && (
                                                    <span className="tdp-rozet tdp-rozet--anlasmali">
                                                        ✓ Anlaşmalı
                                                    </span>
                                                )}
                                                {grup.epostasizSayisi > 0 && (
                                                    <span className="tdp-rozet tdp-tone--red">
                                                        e-posta eksik
                                                    </span>
                                                )}
                                            </span>
                                            <span className="tdp-grup__satir2">
                                                {grup.kategoriler.length > 0
                                                    ? grup.kategoriler.join(" · ")
                                                    : "Kategori girilmemiş"}
                                            </span>
                                        </span>
                                    </button>

                                    {grup.email ? (
                                        <a
                                            className="tdp-grup__eposta"
                                            href={`mailto:${grup.email}`}
                                            title="E-posta gönder"
                                        >
                                            {grup.email}
                                        </a>
                                    ) : (
                                        <span className="tdp-grup__eposta tdp-grup__eposta--yok">
                                            adres yok
                                        </span>
                                    )}

                                    <span className="tdp-grup__sayilar">
                                        <span className="tdp-grup__siparis">
                                            {grup.siparisler.length} sipariş
                                        </span>
                                        <span className="tdp-grup__tutar">
                                            {paraFormatla(grup.toplamTutar)}
                                        </span>
                                    </span>
                                </div>

                                {acik && (
                                    <div className="tdp-grup__govde">
                                        <div className="tdp-grup__icerik">
                                            {grup.tedarikciler.map((tedarikci) => (
                                                <TedarikciKarti
                                                    key={tedarikci.id}
                                                    tedarikci={tedarikci}
                                                    onAc={onKayitAc}
                                                />
                                            ))}
                                        </div>

                                        <div className="tdp-gecmis">
                                            <h3 className="tdp-gecmis__baslik">
                                                Bu firmadan alınanlar
                                            </h3>

                                            {grup.siparisler.length === 0 ? (
                                                <p className="tdp-gecmis__bos">
                                                    Bu firmaya henüz sipariş verilmemiş.
                                                </p>
                                            ) : (
                                                <ul className="tdp-gecmis__liste">
                                                    {grup.siparisler.map((siparis) => (
                                                        <li
                                                            key={siparis.id}
                                                            className="tdp-gecmis__satir"
                                                        >
                                                            <span className="tdp-gecmis__no">
                                                                {siparis.siparisNo ?? "—"}
                                                            </span>
                                                            <span className="tdp-gecmis__tarih">
                                                                {tarihFormatla(
                                                                    siparis.siparisTarihi
                                                                )}
                                                            </span>
                                                            <span
                                                                className={cx(
                                                                    "tdp-gecmis__durum",
                                                                    siparis.teslimTarihi &&
                                                                        "tdp-gecmis__durum--teslim"
                                                                )}
                                                            >
                                                                {siparis.teslimTarihi
                                                                    ? `Teslim · ${tarihFormatla(siparis.teslimTarihi)}`
                                                                    : "Yolda"}
                                                            </span>
                                                            <span className="tdp-gecmis__tutar">
                                                                {paraFormatla(siparis.tutar)}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
