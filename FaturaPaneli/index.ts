import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { FaturaPaneliRoot, IFaturaPaneliProps } from "./components/FaturaPaneliRoot";
import { eksikSutunlar, faturalariEsle } from "./services/datasetMapper";

export class FaturaPaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
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
        const dataset = context.parameters.faturalar;

        const props: IFaturaPaneliProps = {
            faturalar: dataset.loading ? [] : faturalariEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            webAPI: this.webAPI,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(FaturaPaneliRoot, props);
    }

    /** Salt okunur ekran; forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
