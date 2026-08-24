import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { SupplierComparison, ISupplierComparisonProps } from "./components/SupplierComparison";
import { Schema } from "./schema";
import { resolveRules, RulesResolution } from "./services/rules";

/**
 * `context.mode.contextInfo` model-driven formlarda çalışma zamanında mevcuttur
 * ancak @types/powerapps-component-framework içinde tanımlı değildir.
 */
interface ModeContextInfo {
    entityId?: string;
    entityTypeName?: string;
    entityRecordName?: string;
}

export class TedarikciKarsilastirma implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    /** init'te bir kez saklanır: updateView'da kimliği değişmeyen tek bir referans gerekir,
     *  aksi halde React tarafındaki veri yükleme effect'i her render'da yeniden tetiklenir. */
    private webAPI: ComponentFramework.WebApi;

    /** İş kuralları bundle ile geldiği için oturum boyunca sabittir; bir kez çözülür. */
    private rules: RulesResolution;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.webAPI = context.webAPI;
        this.rules = resolveRules();
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
            weights: this.rules.rules.weights,
            kdvOrani: this.rules.rules.kdvOrani,
            ruleWarnings: this.rules.warnings,
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

    /**
     * Para birimi önceliği: formdaki manifest ayarı > businessRules.ts > TRY.
     * Manifest ayarı tek bir forma özel istisna tanımak için vardır; boş
     * bırakıldığında (normal durum) iş kuralları dosyası geçerlidir.
     */
    private getCurrency(context: ComponentFramework.Context<IInputs>): string {
        const configured = context.parameters.paraBirimi.raw;
        const trimmed = configured ? configured.trim() : "";
        return trimmed.length > 0 ? trimmed.toUpperCase() : this.rules.rules.paraBirimi;
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
