import { manifests as modalManifests } from './modals/manifests.js';
import { manifests as repositoryManifests } from './repository/manifests.js';
import { manifests as propertyEditorManifests } from "./property-editors/manifests.ts";

export const manifests = [
    ...modalManifests,
    ...propertyEditorManifests,
    ...repositoryManifests
];