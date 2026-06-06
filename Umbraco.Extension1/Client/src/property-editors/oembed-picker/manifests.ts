export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'propertyEditorUi',
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
];