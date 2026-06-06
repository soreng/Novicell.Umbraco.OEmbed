import type { ManifestPropertyEditorUi, ManifestPropertyEditorSchema } from "@umbraco-cms/backoffice/property-editor";

const propertyEditorSchema: ManifestPropertyEditorSchema = {
    type: "propertyEditorSchema",
    name: "Novicell OEmbed Picker Schema",
    alias: "Novicell.OEmbed.Picker",
    meta: {
        defaultPropertyEditorUiAlias: 'Novicell.PropertyEditorUi.OEmbedPicker',
    },
};

const propertyEditorUi: ManifestPropertyEditorUi = {
    type: "propertyEditorUi",
    alias: 'Novicell.PropertyEditorUi.OEmbedPicker',
        name: 'OEmbed Picker Property Editor UI',
        element: () => import('./property-editor-ui-oembed-picker.element.ts'),
        meta: {
            label: 'OEmbed Picker',
            propertyEditorSchemaAlias: 'Novicell.OEmbed.Picker',
            icon: 'icon-embed',
            group: 'media',
        supportsReadOnly: true,
    },
}

export const oembedPickerPropertyEditorManifests = [propertyEditorSchema, propertyEditorUi];