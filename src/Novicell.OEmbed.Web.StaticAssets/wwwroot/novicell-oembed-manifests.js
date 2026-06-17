const e = [
  {
    type: "modal",
    alias: "Novicell.Modal.OEmbedPicker",
    name: "OEmbed Picker Modal",
    js: () => import("./oembed-picker-modal.element-DTToM4Nq.js")
  }
], o = [...e], t = [...o], i = "Novicell.Repository.OEmbed", r = [
  {
    type: "repository",
    alias: i,
    name: "OEmbed Repository",
    api: () => import("./oembed.repository-Y4nXUpA8.js")
  }
], s = [...r], a = [
  //...componentsManifests,
  ...t,
  ...s
], m = {
  type: "propertyEditorSchema",
  name: "Novicell OEmbed Picker Schema",
  alias: "Novicell.OEmbed.Picker",
  meta: {
    defaultPropertyEditorUiAlias: "Novicell.PropertyEditorUi.OEmbedPicker"
  }
}, c = {
  type: "propertyEditorUi",
  alias: "Novicell.PropertyEditorUi.OEmbedPicker",
  name: "OEmbed Picker Property Editor UI",
  element: () => import("./property-editor-ui-oembed-picker.element-ClOsoWFS.js"),
  meta: {
    label: "OEmbed Picker",
    propertyEditorSchemaAlias: "Novicell.OEmbed.Picker",
    icon: "icon-embed",
    group: "media",
    supportsReadOnly: !0
  }
}, p = [m, c], d = [
  ...p
], l = [
  //    ...entrypoints,
  ...a,
  ...d
];
export {
  l as manifests
};
//# sourceMappingURL=novicell-oembed-manifests.js.map
