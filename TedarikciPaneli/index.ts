import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { TedarikciPaneliRoot, ITedarikciPaneliProps } from "./components/TedarikciPaneliRoot";
import { eksikSutunlar, tedarikcileriEsle } from "./services/datasetMapper";

const TEDARIKCI_ENTITY = "cr545_tedarikciler";

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
            webAPI: context.webAPI,
            onKayitAc: (id: string) => {
                // Desteklenen yol; window.open yerine bunu kullanıyoruz ki
                // uygulama bağlamı korunsun ve açılır pencere engeline takılmasın.
                void context.navigation.openForm({
                    entityName: TEDARIKCI_ENTITY,
                    entityId: id,
                    openInNewWindow: true,
                });
            },
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(TedarikciPaneliRoot, props);
    }

    /** Salt okunur ekran; forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
