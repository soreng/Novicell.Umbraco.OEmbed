import type { UmbExtensionManifestKind } from "@umbraco-cms/backoffice/extension-registry";

import { manifests as oembedManifests } from "./oembed/manifests.ts";
import { propertyEditorManifests } from "./property-editors/manifests.ts";

export const manifests: Array<UmbExtensionManifest | UmbExtensionManifestKind> = [
//    ...entrypoints,
    ...oembedManifests,
    ...propertyEditorManifests,
];


