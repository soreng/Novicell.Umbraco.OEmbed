const e = [
  {
    type: "modal",
    alias: "Novicell.Modal.OEmbedPicker",
    name: "OEmbed Picker Modal",
    js: () => import("./oembed-picker-modal.element-CU5reptc.js")
  }
], i = [...e], o = [...i], t = "Novicell.Repository.OEmbed", a = [
  {
    type: "repository",
    alias: t,
    name: "OEmbed Repository",
    api: () => import("./oembed.repository-Cz7f-l89.js")
  }
], l = [...a], r = [
  //...componentsManifests,
  ...o,
  ...l
], m = {
  type: "propertyEditorSchema",
  name: "Novicell OEmbed Picker Schema",
  alias: "Novicell.OEmbed.Picker",
  meta: {
    defaultPropertyEditorUiAlias: "Novicell.PropertyEditorUi.OEmbedPicker",
    settings: {
      properties: [
        {
          alias: "multiple",
          label: "Pick multiple items",
          description: "Allow picking more than one embed",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
        },
        {
          alias: "validationLimit",
          label: "Amount",
          description: "Set a required range of embeds",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.NumberRange",
          config: [{ alias: "validationRange", value: { min: 0, max: 1 / 0 } }]
        },
        {
          alias: "allowedTypes",
          label: "Accepted types",
          description: "Limit to specific oEmbed types. Leave empty to allow any.",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.CheckBoxList",
          config: [
            {
              alias: "items",
              value: [
                { name: "Photo", value: "photo" },
                { name: "Video", value: "video" },
                { name: "Link", value: "link" },
                { name: "Rich", value: "rich" }
              ]
            }
          ]
        }
      ]
    }
  }
}, n = {
  type: "propertyEditorUi",
  alias: "Novicell.PropertyEditorUi.OEmbedPicker",
  name: "OEmbed Picker Property Editor UI",
  element: () => import("./property-editor-ui-oembed-picker.element-5DCt487o.js"),
  meta: {
    label: "OEmbed Picker",
    propertyEditorSchemaAlias: "Novicell.OEmbed.Picker",
    icon: "icon-embed",
    group: "media",
    supportsReadOnly: !0
  }
}, s = [m, n], c = [
  ...s
], p = [
  {
    type: "localization",
    alias: "Novicell.OEmbed.Localization.EN",
    name: "Novicell OEmbed English Localization",
    meta: { culture: "en" },
    js: () => import("./en-BpNHt5Rp.js")
  },
  {
    type: "localization",
    alias: "Novicell.OEmbed.Localization.EN_US",
    name: "Novicell OEmbed English (US) Localization",
    meta: { culture: "en-US" },
    js: () => import("./en-BpNHt5Rp.js")
  },
  {
    type: "localization",
    alias: "Novicell.OEmbed.Localization.DA",
    name: "Novicell OEmbed Danish Localization",
    meta: { culture: "da" },
    js: () => import("./da-BCHA38ws.js")
  },
  {
    type: "localization",
    alias: "Novicell.OEmbed.Localization.DA_DK",
    name: "Novicell OEmbed Danish (Denmark) Localization",
    meta: { culture: "da-DK" },
    js: () => import("./da-BCHA38ws.js")
  }
], d = [
  //    ...entrypoints,
  ...r,
  ...c,
  ...p
];
export {
  d as manifests
};
//# sourceMappingURL=novicell-oembed-manifests.js.map
