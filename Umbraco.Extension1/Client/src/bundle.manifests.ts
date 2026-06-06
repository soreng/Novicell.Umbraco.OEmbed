import { manifests as entrypoints } from "./entrypoints/manifests.ts";
import { manifests as oembed } from "./oembed/manifests.ts";

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from umbraco-package.json
export const manifests: Array<UmbExtensionManifest> = [
    ...entrypoints,
    ...oembed,
];