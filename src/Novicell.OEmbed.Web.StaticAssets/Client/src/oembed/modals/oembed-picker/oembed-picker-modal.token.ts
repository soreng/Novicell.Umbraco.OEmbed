import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import { OEmbedType } from "../../../api";

export interface OEmbedModalData {
    url?: string;
    allowedTypes?: string[];
}

export interface OEmbedResponse {
    type: OEmbedType;
    width?: number | null;
    height?: number | null;
    url?: string | null;
    html?: string | null;
    title?: string | null;
    authorUrl?: string | null;
    authorName?: string | null;
    providerUrl?: string | null;
    providerName?: string | null;
    thumbnailUrl?: string | null;
    thumbnailWidth?: number | null;
    thumbnailHeight?: number | null;
}

export interface OEmbedModalValue {
    url: string;
    oembed: OEmbedResponse;
}

export const OEMBED_MODAL = new UmbModalToken<OEmbedModalData, OEmbedModalValue>(
    'Novicell.Modal.OEmbedPicker',
    {
        modal: {
            type: 'sidebar',
            size: 'small',
        },
    },
);