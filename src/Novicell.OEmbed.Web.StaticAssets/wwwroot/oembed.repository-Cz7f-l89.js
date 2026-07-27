import { c } from "./client.gen-DVwspqDp.js";
import { tryExecute as i } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as m } from "@umbraco-cms/backoffice/class-api";
class u {
  static getOEmbed(e) {
    return (e?.client ?? c).get({
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
    return i(
      this.#e,
      u.getOEmbed({
        query: { url: e, maxwidth: t, maxheight: r }
      }),
      // The picker modal renders its own localized error message from the response's
      // operationStatus, so suppress the SDK's default toast (which would show the raw,
      // unlocalized server title/detail).
      { disableNotifications: !0 }
    );
  }
}
class h extends m {
  #e = new d(this);
  constructor(e) {
    super(e);
  }
  async requestOEmbed({ url: e, maxWidth: t, maxHeight: r }) {
    const { data: o, error: a } = await this.#e.getOEmbed({ url: e, maxWidth: t, maxHeight: r });
    return a ? { error: a } : { data: o };
  }
}
export {
  h as OEmbedRepository,
  h as api
};
//# sourceMappingURL=oembed.repository-Cz7f-l89.js.map
