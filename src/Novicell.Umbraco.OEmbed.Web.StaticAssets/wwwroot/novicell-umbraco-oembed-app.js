import { UMB_AUTH_CONTEXT as i } from "@umbraco-cms/backoffice/auth";
import { c as r } from "./client.gen-DVwspqDp.js";
const c = (o, t) => {
  o.consumeContext(i, async (e) => {
    const n = e?.getOpenApiConfiguration();
    r.setConfig({
      auth: n?.token ?? void 0,
      baseUrl: n?.base ?? "",
      credentials: n?.credentials ?? "same-origin",
      // Throw on error responses so Umbraco's tryExecute can catch them and show a notification.
      throwOnError: !0
    });
  });
}, g = (o, t) => {
};
export {
  c as onInit,
  g as onUnload
};
//# sourceMappingURL=novicell-umbraco-oembed-app.js.map
