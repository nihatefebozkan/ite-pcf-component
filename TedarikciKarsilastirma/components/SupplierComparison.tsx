import * as React from "react";
import { LoadState, MarketFinding, ScoredSupplier, TalepContext } from "../types";
import {
    EMPTY_TALEP,
    assignSupplierToOrder,
    fetchMarketFindings,
    fetchSelectedSupplierId,
    fetchSuppliers,
    fetchTalepContext,
} from "../services/dataService";
import { scoreSuppliers } from "../services/scoring";
import {
    buildMarketComparison,
    buildMarketConclusion,
    buildSelectionRationale,
} from "../services/orderSummary";
import { SupplierCard } from "./SupplierCard";
import { MarketResearchList } from "./MarketResearchList";
import { SummaryStrip, ISummaryItem } from "./SummaryStrip";
import { Spinner } from "./Spinner";
import { cx, formatCurrency } from "./theme";

export interface ISupplierComparisonProps {
    webAPI: ComponentFramework.WebApi;
    /** Formda açık olan Talep kaydının id'si; yeni (kaydedilmemiş) kayıtta null. */
    talepId: string | null;
    /** Formun bağlı olduğu tablonun logical name'i (contextInfo'dan). */
    talepEntityName: string;
    /** Talep kaydının görünen adı (contextInfo'dan). */
    talepAdi: string | null;
    currency: string;
    /** Tedarikçileri, talebin UrunTipi değerine göre filtrele. */
    filterByCategory: boolean;
    /** Talebe bağlı sipariş yoksa yeni sipariş kaydı aç. */
    createOrderIfMissing: boolean;
    /** Form salt okunur ya da kullanıcının yazma yetkisi yok. */
    isDisabled: boolean;
    /** Ayrılan yükseklik (px). Sınırsızsa null. */
    allocatedHeight: number | null;
    /** Ayrılan genişlik (px). Tek/çift sütun kararı buna bakar. */
    allocatedWidth: number | null;
}

interface Notice {
    tone: "success" | "warning" | "error";
    text: string;
}

/** Bu genişliğin altında iki sütun sıkışıyor, alt alta geçiliyor. */
const NARROW_BREAKPOINT = 900;

function errorText(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
        return String((err as { message: unknown }).message);
    }
    return "Bilinmeyen bir hata oluştu.";
}

export const SupplierComparison: React.FC<ISupplierComparisonProps> = (props) => {
    const {
        webAPI,
        talepId,
        talepEntityName,
        talepAdi,
        currency,
        filterByCategory,
        createOrderIfMissing,
        isDisabled,
        allocatedHeight,
        allocatedWidth,
    } = props;

    // Form alan yüksekliği bildirmediğinde (-1) sabit bir taban yükseklik kullan.
    const rootSizing: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0
            ? { height: `${allocatedHeight}px` }
            : { minHeight: "640px" };

    const isNarrow = allocatedWidth !== null && allocatedWidth < NARROW_BREAKPOINT;
    const rootClass = cx("nek-tk", isNarrow && "nek-tk--narrow");

    const [state, setState] = React.useState<LoadState>("idle");
    const [error, setError] = React.useState<string | null>(null);
    const [talep, setTalep] = React.useState<TalepContext | null>(null);
    const [suppliers, setSuppliers] = React.useState<ScoredSupplier[]>([]);
    const [findings, setFindings] = React.useState<MarketFinding[]>([]);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [busyId, setBusyId] = React.useState<string | null>(null);
    const [notice, setNotice] = React.useState<Notice | null>(null);
    const [reloadToken, setReloadToken] = React.useState(0);

    React.useEffect(() => {
        // Component sökülürse ya da yeni bir yükleme başlarsa eski cevabı yok say.
        let cancelled = false;

        async function load() {
            setState("loading");
            setError(null);

            // Talep bağlamı yalnızca başlığı ve kategori filtresini besler.
            // Okunamazsa asıl işi (tedarikçi karşılaştırması) düşürmek yerine
            // filtresiz devam edip kullanıcıyı uyarıyoruz.
            let talepContext = EMPTY_TALEP;
            let talepWarning: string | null = null;
            try {
                talepContext = await fetchTalepContext(webAPI, talepEntityName, talepId, talepAdi);
            } catch (err) {
                talepWarning = `Talep bilgisi okunamadı (${errorText(err)}). Kategori filtresi uygulanmadan tüm tedarikçiler listeleniyor.`;
            }

            try {
                const kategori = filterByCategory ? talepContext.urunTipi : null;

                const [supplierRows, marketRows, currentSelection] = await Promise.all([
                    fetchSuppliers(webAPI, kategori),
                    fetchMarketFindings(webAPI, talepId),
                    fetchSelectedSupplierId(webAPI, talepId),
                ]);

                if (cancelled) return;

                setTalep(talepContext);
                setSuppliers(scoreSuppliers(supplierRows));
                setFindings(marketRows);
                setSelectedId(currentSelection);
                setNotice(talepWarning ? { tone: "warning", text: talepWarning } : null);
                setState("ready");
            } catch (err) {
                if (cancelled) return;
                setError(errorText(err));
                setState("error");
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [webAPI, talepId, talepEntityName, talepAdi, filterByCategory, reloadToken]);

    const assignSelection = React.useCallback(
        async (supplier: ScoredSupplier): Promise<void> => {
            if (!talepId) {
                setNotice({
                    tone: "error",
                    text: "Talep kaydı henüz kaydedilmemiş; tedarikçi atanamaz.",
                });
                return;
            }

            setBusyId(supplier.id);
            setNotice(null);
            try {
                const result = await assignSupplierToOrder(
                    webAPI,
                    talepId,
                    {
                        tedarikciId: supplier.id,
                        tutar: supplier.fiyat,
                        secimGerekcesi: buildSelectionRationale(supplier, suppliers.length),
                        piyasaKarsilastirmaSonucu: buildMarketComparison(supplier, findings, currency),
                    },
                    createOrderIfMissing
                );
                setSelectedId(supplier.id);

                const base =
                    result.action === "created"
                        ? `${supplier.ad} seçildi ve bu talep için yeni bir sipariş kaydı oluşturuldu.`
                        : `${supplier.ad} siparişe tedarikçi olarak atandı.`;

                setNotice(
                    result.detailWarning
                        ? { tone: "warning", text: `${base} ${result.detailWarning}` }
                        : { tone: "success", text: base }
                );
            } catch (err) {
                setNotice({ tone: "error", text: `Tedarikçi atanamadı: ${errorText(err)}` });
            } finally {
                setBusyId(null);
            }
        },
        [webAPI, talepId, createOrderIfMissing, suppliers, findings, currency]
    );

    // Kart tıklaması senkron bir handler bekler; promise'i burada yutuyoruz
    // (hata durumu zaten assignSelection içinde bildirime dönüşüyor).
    const handleSelect = React.useCallback(
        (supplier: ScoredSupplier): void => {
            void assignSelection(supplier);
        },
        [assignSelection]
    );

    const handleRefresh = React.useCallback(() => {
        setNotice(null);
        setReloadToken((t) => t + 1);
    }, []);

    const bestInternalPrice = React.useMemo(() => {
        const prices = suppliers.map((s) => s.fiyat).filter((p): p is number => p !== null);
        return prices.length > 0 ? Math.min(...prices) : null;
    }, [suppliers]);

    if (state === "loading" || state === "idle") {
        return (
            <div className={rootClass} style={rootSizing}>
                <div className="nek-tk-centered">
                    <Spinner label="Tedarikçi verileri yükleniyor…" />
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <div className={rootClass} style={rootSizing}>
                <div className="nek-tk-centered">
                    <h2 className="nek-tk__title">Veriler yüklenemedi</h2>
                    <p className="nek-tk-centered__text">{error}</p>
                    <button type="button" className="nek-tk-btn nek-tk-btn--primary" onClick={handleRefresh}>
                        Yeniden dene
                    </button>
                </div>
            </div>
        );
    }

    const best = suppliers.length > 0 ? suppliers[0] : null;
    const cheapestMarket = findings
        .map((f) => f.bulunanFiyat)
        .filter((p): p is number => p !== null)
        .reduce<number | null>((min, p) => (min === null || p < min ? p : min), null);
    const cheapestMarketSource = findings.find((f) => f.bulunanFiyat === cheapestMarket)?.kaynakSite;

    const summaryItems: ISummaryItem[] = [
        { label: "Ürün tipi", value: talep?.urunTipiEtiketi ?? "Belirtilmemiş" },
        { label: "En iyi iç skor", value: best ? `${best.score}/100` : "—", meta: best?.ad },
        {
            label: "En düşük piyasa fiyatı",
            value: formatCurrency(cheapestMarket, currency),
            meta: cheapestMarketSource,
        },
    ];

    return (
        <div className={rootClass} style={rootSizing}>
            <div className="nek-tk__header">
                <div className="nek-tk__title-block">
                    {talepAdi && <span className="nek-tk__eyebrow">{talepAdi}</span>}
                    <h2 className="nek-tk__title">Tedarikçi Karşılaştırma</h2>
                    <p className="nek-tk__subtitle">
                        Anlaşmalı tedarikçi teklifleri ve serbest piyasa fiyatları bir arada.
                    </p>
                </div>

                <div className="nek-tk__side">
                    {talep?.oncelikEtiketi && (
                        <span className="nek-tk-chip nek-tk-chip--priority">{talep.oncelikEtiketi}</span>
                    )}
                    {talep?.durumEtiketi && (
                        <span className="nek-tk-chip nek-tk-chip--status">{talep.durumEtiketi}</span>
                    )}
                    <button type="button" className="nek-tk-btn nek-tk-btn--subtle" onClick={handleRefresh}>
                        ⟳ Yenile
                    </button>
                </div>
            </div>

            <SummaryStrip items={summaryItems} />

            {notice && (
                <p className={cx("nek-tk-notice", `nek-tk-notice--${notice.tone}`)} role="status">
                    {notice.text}
                </p>
            )}

            <div className="nek-tk__cols">
                <div className="nek-tk__col">
                    <div className="nek-tk-section">
                        <div className="nek-tk-section__text">
                            <h3 className="nek-tk-section__title">İç Tedarikçiler</h3>
                            <p className="nek-tk-section__note">
                                Fiyat, teslim süresi, güvenilirlik ve garanti şartlarına göre skorlandı.
                            </p>
                        </div>
                        <span className="nek-tk-chip nek-tk-chip--ai">✦ Skorlandı</span>
                    </div>

                    {suppliers.length === 0 ? (
                        <p className="nek-tk-empty">
                            {filterByCategory && talep?.urunTipiEtiketi
                                ? `"${talep.urunTipiEtiketi}" için Tedarikciler tablosunda eşleşen kayıt bulunamadı.`
                                : "Tedarikciler tablosunda kayıt bulunamadı."}
                        </p>
                    ) : (
                        <div className="nek-tk__card-list">
                            {suppliers.map((supplier) => (
                                <SupplierCard
                                    key={supplier.id}
                                    supplier={supplier}
                                    isRecommended={best !== null && supplier.id === best.id}
                                    isSelected={supplier.id === selectedId}
                                    isBusy={busyId === supplier.id}
                                    currency={currency}
                                    disabled={isDisabled || busyId !== null || !talepId}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="nek-tk__col">
                    <div className="nek-tk-section">
                        <div className="nek-tk-section__text">
                            <h3 className="nek-tk-section__title">Piyasa Araştırması</h3>
                            <p className="nek-tk-section__note">
                                Çerçeve anlaşmaları dışında, aynı ürün için bulunan fiyatlar.
                            </p>
                        </div>
                    </div>

                    <MarketResearchList
                        findings={findings}
                        currency={currency}
                        bestInternalPrice={bestInternalPrice}
                        conclusion={buildMarketConclusion(bestInternalPrice, findings, currency)}
                    />
                </div>
            </div>
        </div>
    );
};
