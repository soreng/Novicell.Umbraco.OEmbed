export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "umbext1Entrypoint",
    alias: "umb_ext1.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
