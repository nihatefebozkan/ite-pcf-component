import * as React from "react";
import { ButceDonemi } from "../types";
import { cx, paraFormatla, tuketimHesapla, tuketimTonu, yuzdeFormatla } from "./theme";

export interface IButcePaneliProps {
    donemler: ButceDonemi[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

/** Ton sınıfından çubuk dolgusunun sınıfını türetir. */
function cubukDolgusu(tonSinifi: string): string {
    const ton = tonSinifi.replace("btp-tone--", "");
    return `btp-cubuk__dolu btp-cubuk__dolu--${ton}`;
}

/** Güncel dönem — büyük kart, tüketim çubuğuyla. */
const GuncelDonem: React.FC<{ donem: ButceDonemi }> = ({ donem }) => {
    const { kalan, yuzde, asim } = tuketimHesapla(donem);
    const ton = tuketimTonu(yuzde, asim);

    return (
        <div className={cx("btp-guncel", asim && "btp-guncel--asim")}>
            <span className="btp-guncel__donem">{donem.donem ?? "Dönem belirtilmemiş"}</span>

            <div className="btp-guncel__ust">
                <div className="btp-guncel__kalan">
                    <span className={cx("btp-guncel__tutar", asim && "btp-guncel__tutar--asim")}>
                        {kalan === null
                            ? "—"
                            : paraFormatla(asim ? Math.abs(kalan) : kalan)}
                    </span>
                    <span className="btp-guncel__etiket">
                        {kalan === null
                            ? "Toplam bütçe girilmemiş"
                            : asim
                              ? "bütçe aşımı"
                              : "kullanılabilir bütçe"}
                    </span>
                </div>
                {yuzde !== null && (
                    <span className={cx("btp-guncel__yuzde", ton)}>{yuzdeFormatla(yuzde)}</span>
                )}
            </div>

            {yuzde !== null && (
                <div className="btp-cubuk">
                    {/* Aşımda çubuk %100'de durur; aşım miktarı üstteki tutarda yazıyor. */}
                    <div
                        className={cubukDolgusu(ton)}
                        style={{ width: `${Math.min(100, Math.max(0, yuzde))}%` }}
                    />
                </div>
            )}

            <div className="btp-rakamlar">
                <span>
                    Kullanılan <strong>{paraFormatla(donem.kullanilan)}</strong>
                </span>
                <span>
                    Toplam <strong>{paraFormatla(donem.toplam)}</strong>
                </span>
            </div>
        </div>
    );
};

/** Geçmiş dönemler — kompakt satırlar. */
const GecmisSatir: React.FC<{ donem: ButceDonemi }> = ({ donem }) => {
    const { yuzde, asim } = tuketimHesapla(donem);
    const ton = tuketimTonu(yuzde, asim);

    return (
        <div className="btp-satir">
            <span className="btp-satir__donem">{donem.donem ?? "—"}</span>

            <div className="btp-cubuk">
                {yuzde !== null && (
                    <div
                        className={cubukDolgusu(ton)}
                        style={{ width: `${Math.min(100, Math.max(0, yuzde))}%` }}
                    />
                )}
            </div>

            <div className="btp-satir__sag">
                <span className="btp-satir__tutar">
                    {paraFormatla(donem.kullanilan)} / {paraFormatla(donem.toplam)}
                </span>
                <span className={cx("btp-rozet", ton)}>{yuzdeFormatla(yuzde)}</span>
            </div>
        </div>
    );
};

export const ButcePaneliRoot: React.FC<IButcePaneliProps> = (props) => {
    const {
        donemler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("btp", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "btp--dar");

    // En yeni dönem büyük kartta, kalanlar altta kompakt satırlarda.
    const [guncel, ...gecmis] = donemler;

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="btp__bar">
                <div>
                    <h2 className="btp__baslik">Şirket Bütçesi</h2>
                    <p className="btp__ozet">Dönemlik toplam bütçe ve tüketim.</p>
                </div>

                <button
                    type="button"
                    className="btp-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="btp-bildirim btp-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok: {eksikSutunlar.join(", ")}. Tüketim hesaplanamaz.
                </p>
            )}

            {datasetHatasi ? (
                <p className="btp-bildirim btp-bildirim--hata" role="status">
                    Bütçe yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && donemler.length === 0 ? (
                <div className="btp-merkez">
                    <span className="btp-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="btp-merkez__metin">Bütçe yükleniyor…</p>
                </div>
            ) : donemler.length === 0 ? (
                <div className="btp-bos">
                    <span className="btp-bos__baslik">Bütçe dönemi tanımlanmamış</span>
                    <span className="btp-bos__metin">
                        Şirket Bütçesi tablosuna bir dönem kaydı ekleyin.
                    </span>
                </div>
            ) : (
                <>
                    <GuncelDonem donem={guncel} />

                    {gecmis.length > 0 && (
                        <div className="btp-gecmis">
                            <span className="btp-gecmis__baslik">Önceki dönemler</span>
                            {gecmis.map((donem) => (
                                <GecmisSatir key={donem.id} donem={donem} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
