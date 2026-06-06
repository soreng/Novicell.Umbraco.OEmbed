const e = [
  {
    name: "umbext1Entrypoint",
    alias: "umb_ext1.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-FW3xWapY.js")
  }
], t = [
  {
    type: "modal",
    alias: "Novicell.Modal.OEmbedPicker",
    name: "OEmmed Picker Modal",
    js: () => import("./oembed-picker-modal.element-DOPC6T9J.js")
  }
], o = [...t], i = [...o], s = "Novicell.Repository.OEmbed", m = [
  {
    type: "repository",
    alias: s,
    name: "OEmbed Repository",
    api: () => import("./oembed.repository-CWt6Q9p-.js")
  }
], n = [...m], a = [
  {
    type: "propertyEditorUi",
    alias: "Novicell.PropertyEditorUi.OEmbedPicker",
    name: "OEmbed Picker Property Editor UI",
    element: () => import("./property-editor-ui-oembed-picker.element-CDzYDypB.js"),
    meta: {
      label: "OEmbed Picker",
      propertyEditorSchemaAlias: "Novicell.OEmbed.Picker",
      icon: "icon-embed",
      group: "media",
      supportsReadOnly: !0
    }
  }
], r = [...a], c = [
  ...i,
  ...r,
  ...n
], p = [
  ...e,
  ...c
];
export {
  p as manifests
};
//# sourceMappingURL=novicell-oembed-1.js.map
