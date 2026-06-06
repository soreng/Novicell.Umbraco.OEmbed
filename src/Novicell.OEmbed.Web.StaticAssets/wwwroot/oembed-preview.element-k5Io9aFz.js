import { css as w, query as f, property as b, customElement as u, nothing as _, when as g, html as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as y } from "@umbraco-cms/backoffice/lit-element";
var E = Object.defineProperty, x = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, s = (e, t, o, i) => {
  for (var r = i > 1 ? void 0 : i ? x(t, o) : t, n = e.length - 1, d; n >= 0; n--)
    (d = e[n]) && (r = (i ? d(t, o, r) : d(r)) || r);
  return i && r && E(t, o, r), r;
}, $ = (e, t, o) => t.has(e) || p("Cannot " + o), C = (e, t, o) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), m = (e, t, o) => ($(e, t, "access private method"), o), l, c, v;
let a = class extends y {
  constructor() {
    super(...arguments), C(this, l);
  }
  // use the connectedCallback as suggested by Jacob Overgaard as this is where the this.value is available and assigned
  connectedCallback() {
    super.connectedCallback();
  }
  /**
   * Updated runs every time the element renders, so it's well-
   * suited for managing light DOM children, or anything else that you
   * don't directly control in your template.
   * @param  {Map<string, any>} changedProperties
   */
  updated(e) {
    console.log("updated", e), super.updated(e);
  }
  render() {
    const e = this.value;
    return e === void 0 ? _ : g(
      e.type == "photo",
      () => m(this, l, c).call(this, e.url, e.width, e.height),
      () => m(this, l, v).call(this, e.html, e.width, e.height)
    );
  }
};
l = /* @__PURE__ */ new WeakSet();
c = function(e, t, o) {
  return h`<img
      class="oembed-photo"
      src="${e}"
      width="${t}"
      height="${o}"
    />`;
};
v = function(e, t, o) {
  const i = t && o ? t / o : 0;
  var r = window.document.createElement("div");
  r.insertAdjacentHTML("afterbegin", e);
  let n = "";
  i > 0 && (r.style.width = "100%", r.style.height = "100%", n = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow: hidden}</style>");
  const d = `<html><head></head><body>${n}${r.outerHTML}</body></html>`;
  return h` <iframe
      srcdoc="${d}"
      class="oembed-frame"
      style="${i > 0 ? "aspect-ratio:" + i + ";" : ""}"
      sandbox="allow-scripts allow-same-origin allow-presentation"
    ></iframe>`;
};
a.tagName = "oembed-preview";
a.styles = [
  w`
      .oembed-frame,
      .oembed-photo {
        max-width: 100%;
      }

      .oembed-frame {
        margin: 0;
        width: 100%;
        border: none;
        //height: 0;
        //border:2px solid deeppink;
      }

      .oembed-photo {
        height: auto;
        //border:2px solid greenyellow;
      }

      .oembed-container {
        max-width: 100%;
        width: 100%;
      }

      .novicell-oembed-preview__container--fixed-ratio {
        position: relative;
        padding-top: 0;
      }

      .novicell-oembed-preview .novicell-oembed-preview__frame {
        width: 100%;
        height: 0;
      }

      .novicell-oembed-preview
        .novicell-oembed-preview__container--fixed-ratio
        .novicell-oembed-preview__frame {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
      }

      .novicell-oembed-preview .__info {
        position: unset;
        opacity: unset;
      }
    `
];
s([
  f(".oembed-frame")
], a.prototype, "frame", 2);
s([
  b()
], a.prototype, "value", 2);
a = s([
  u(a.tagName)
], a);
//# sourceMappingURL=oembed-preview.element-k5Io9aFz.js.map
