import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { SupplierComparison, ISupplierComparisonProps } from "./components/SupplierComparison";
import { Schema } from "./schema";

/**
 * `context.mode.contextInfo` model-driven formlarda çalışma zamanında mevcuttur
 * ancak @types/powerapps-component-framework içinde tanımlı değildir.
 */
interface ModeContextInfo {
    entityId?: string;
    entityTypeName?: string;
    entityRecordName?: string;
}

const DEFAULT_CURRENCY = "TRY";

export class TedarikciKarsilastirma implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    /** init'te bir kez saklanır: updateView'da kimliği değişmeyen tek bir referans gerekir,
     *  aksi halde React tarafındaki veri yükleme effect'i her render'da yeniden tetiklenir. */
    private webAPI: ComponentFramework.WebApi;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.webAPI = context.webAPI;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const contextInfo = this.getContextInfo(context);

        const props: ISupplierComparisonProps = {
            webAPI: this.webAPI,
            talepId: contextInfo.entityId ? contextInfo.entityId.replace(/[{}]/g, "") : null,
            // Tablo adı ve kayıt adı platformdan geliyor; schema.ts'teki değer
            // yalnızca contextInfo yoksa (harness/test) devreye girer.
            talepEntityName: contextInfo.entityTypeName ?? Schema.talep.entity,
            talepAdi: contextInfo.entityRecordName ?? null,
            currency: this.getCurrency(context),
            // Varsayılanlar manifestteki default-value'dan gelir:
            // kategori filtresi açık, sipariş oluşturma kapalı.
            filterByCategory: context.parameters.kategoriFiltresi.raw === true,
            createOrderIfMissing: context.parameters.siparisOlustur.raw === true,
            isDisabled: context.mode.isControlDisabled,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
        };

        return React.createElement(SupplierComparison, props);
    }

    /** Yapılandırılmamış ya da boş bırakılmış para birimi kodunda varsayılana döner. */
    private getCurrency(context: ComponentFramework.Context<IInputs>): string {
        const configured = context.parameters.paraBirimi.raw;
        const trimmed = configured ? configured.trim() : "";
        return trimmed.length > 0 ? trimmed : DEFAULT_CURRENCY;
    }

    /**
     * Formun kayıt bağlamı. Model-driven formda doludur; test harness'ında ya da
     * kaydedilmemiş yeni kayıtta alanları boş gelebilir.
     */
    private getContextInfo(context: ComponentFramework.Context<IInputs>): ModeContextInfo {
        return (context.mode as unknown as { contextInfo?: ModeContextInfo }).contextInfo ?? {};
    }

    /** Bağlı alan yalnızca taşıyıcıdır; değeri değiştirilmez. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker; ayrıca temizlenecek kaynak yok.
    }
}
