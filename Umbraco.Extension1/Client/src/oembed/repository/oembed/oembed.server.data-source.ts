import {NovicellOEmbedService} from '../../../api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { tryExecute } from '@umbraco-cms/backoffice/resources';

/**
 * A data source for the OEmbed that fetches data from a given URL.
 * @class UmbOEmbedServerDataSource
 * @implements {RepositoryDetailDataSource}
 */
export class OEmbedServerDataSource {
    #host: UmbControllerHost;

    /**
     * Creates an instance of OEmbedServerDataSource.
     * @param {UmbControllerHost} host - The controller host for this controller to be appended to
     * @memberof OEmbedServerDataSource
     */
    constructor(host: UmbControllerHost) {
        this.#host = host;
    }

    /**
     * Fetches markup for the given URL.
     * @param {string} url
     * @param {number} maxWidth
     * @param {number} maxHeight
     * @param {string} type
     * @memberof OEmbedServerDataSource
     */
    async getOEmbed({ url, maxWidth, maxHeight }: { url?: string; maxWidth?: number; maxHeight?: number }) {
        return tryExecute(this.#host, NovicellOEmbedService.getOEmbed({ query: { url, maxwidth: maxWidth, maxheight: maxHeight } }));
    }
}