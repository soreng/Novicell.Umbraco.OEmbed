import { c as o } from "./client.gen-DVwspqDp.js";
import { tryExecute as m } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as i } from "@umbraco-cms/backoffice/class-api";
class u {
  static getOEmbed(e) {
    return (e?.client ?? o).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
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
  async getOEmbed({
    url: e,
    maxWidth: t,
    maxHeight: r
  }) {
    return m(
      this.#e,
      u.getOEmbed({
        query: { url: e, maxwidth: t, maxheight: r }
      })
    );
  }
}
class h extends i {
  #e = new d(this);
  constructor(e) {
    super(e);
  }
  async requestOEmbed({ url: e, maxWidth: t, maxHeight: r }) {
    const { data: c, error: a } = await this.#e.getOEmbed({ url: e, maxWidth: t, maxHeight: r });
    return a ? { error: a } : { data: c };
  }
}
export {
  h as OEmbedRepository,
  h as api
};
//# sourceMappingURL=oembed.repository-Y4nXUpA8.js.map
