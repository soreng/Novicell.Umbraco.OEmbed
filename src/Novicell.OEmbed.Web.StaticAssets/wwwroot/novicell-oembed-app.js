import { UMB_AUTH_CONTEXT as i } from "@umbraco-cms/backoffice/auth";
import { c as s } from "./client.gen-C8It7zoJ.js";
const a = (o, e) => {
  console.log("Novicell OEmbed Entrypoint initialized"), o.consumeContext(i, async (t) => {
    const n = t?.getOpenApiConfiguration();
    s.setConfig({
      auth: n?.token ?? void 0,
      baseUrl: n?.base ?? "",
      credentials: n?.credentials ?? "same-origin"
    });
  });
}, l = (o, e) => {
};
export {
  a as onInit,
  l as onUnload
};
//# sourceMappingURL=novicell-oembed-app.js.map
