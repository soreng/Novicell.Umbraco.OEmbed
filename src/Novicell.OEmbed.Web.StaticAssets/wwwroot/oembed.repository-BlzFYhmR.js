import { c as m } from "./client.gen-C8It7zoJ.js";
import { tryExecute as i } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as s } from "@umbraco-cms/backoffice/class-api";
class b {
  static getUmbracoNovicellOembedApiV1Oembed(e) {
    return (e?.client ?? m).get({
      url: "/umbraco/novicell-oembed/api/v1/oembed",
      ...e
    });
  }
}
class d {
  #e;
  /**
   * Creates an instance of OEmbedServerDataSource.
   * @param {UmbControllerHost} host - The controller host for this controller to be appended to
   * @memberof OEmbedServerDataSource
   */
  constructor(e) {
    this.#e = e;
  }
  /**
   * Fetches markup for the given URL.
   * @param {string} url
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {string} type
   * @memberof OEmbedServerDataSource
   */
  async getOEmbed({ url: e, maxWidth: r, maxHeight: t }) {
    return i(this.#e, b.getUmbracoNovicellOembedApiV1Oembed({ query: { url: e, maxwidth: r, maxheight: t } }));
  }
}
class O extends s {
  #e = new d(this);
  constructor(e) {
    super(e);
  }
  async requestOEmbed({ url: e, maxWidth: r, maxHeight: t }) {
    const { data: a, error: c } = await this.#e.getOEmbed({ url: e, maxWidth: r, maxHeight: t });
    return c ? { error: c } : { data: a };
  }
}
export {
  O as OEmbedRepository,
  O as api
};
//# sourceMappingURL=oembed.repository-BlzFYhmR.js.map
