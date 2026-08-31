import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { TedarikciPaneliRoot, ITedarikciPaneliProps } from "./components/TedarikciPaneliRoot";
import { eksikSutunlar, tedarikcileriEsle } from "./services/datasetMapper";

export class TedarikciPaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const dataset = context.parameters.tedarikciler;

        const props: ITedarikciPaneliProps = {
            tedarikciler: dataset.loading ? [] : tedarikcileriEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(TedarikciPaneliRoot, props);
    }

    /** Salt okunur ekran; Web API kullanmıyor, forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
