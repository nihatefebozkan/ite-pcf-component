import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { KararGecmisi, IKararGecmisiProps } from "./components/KararGecmisi";
import { eksikSutunlar, kararlariEsle } from "./services/datasetMapper";

export class MudurKararGecmisi implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    /** init'te bir kez saklanır; updateView'da kimliği değişmeyen tek referans gerekir. */
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
        const dataset = context.parameters.onaylar;

        const props: IKararGecmisiProps = {
            kararlar: dataset.loading ? [] : kararlariEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            webAPI: this.webAPI,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(KararGecmisi, props);
    }

    /** Salt okunur ekran; forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
