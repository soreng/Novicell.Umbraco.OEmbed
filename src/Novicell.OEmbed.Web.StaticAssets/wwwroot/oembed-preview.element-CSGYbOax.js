import { css as b, query as g, property as y, customElement as E, nothing as x, when as M, html as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as O } from "@umbraco-cms/backoffice/lit-element";
var $ = Object.defineProperty, C = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, h = (e, t, o, i) => {
  for (var r = i > 1 ? void 0 : i ? C(t, o) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (i ? s(t, o, r) : s(r)) || r);
  return i && r && $(t, o, r), r;
}, u = (e, t, o) => t.has(e) || f("Cannot " + o), c = (e, t, o) => (u(e, t, "read from private field"), o ? o.call(e) : t.get(e)), m = (e, t, o) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), p = (e, t, o) => (u(e, t, "access private method"), o), l, d, w, _;
let a = class extends O {
  constructor() {
    super(...arguments), m(this, d), m(this, l, new MutationObserver((e, t) => {
      var o = this.onMutation;
      e.forEach(function(i) {
        o(i, t);
      });
    }));
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
  onMutation(e, t) {
    console.log("mutation", e, t);
  }
  render() {
    const e = this.value;
    return e === void 0 ? x : M(
      e.type == "photo",
      () => p(this, d, w).call(this, e.url, e.width, e.height),
      () => p(this, d, _).call(this, e.html, e.width, e.height)
    );
  }
};
l = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
w = function(e, t, o) {
  return v`<img 
                class="oembed-photo"
                src="${e}"
                width="${t}"
                height="${o}"/>`;
};
_ = function(e, t, o) {
  c(this, l).takeRecords(), c(this, l).disconnect();
  const i = t && o ? t / o : 0;
  var r = window.document.createElement("div");
  r.insertAdjacentHTML("afterbegin", e);
  let n = "";
  i > 0 && (r.style.width = "100%", r.style.height = "100%", n = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow: hidden}</style>");
  const s = `<html><head></head><body>${n}${r.outerHTML}</body></html>`;
  return v`
            <iframe
                    srcdoc="${s}"
                    class="oembed-frame"
                    style="${i > 0 ? "aspect-ratio:" + i + ";" : ""}"
                    onload="this.#observer.observe(this.#frame)"
                    sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>`;
};
a.tagName = "oembed-preview";
a.styles = [
  b`
            .oembed-frame,
            .oembed-photo {
                max-width: 100%;
            }

            .oembed-frame{
                margin: 0;
                width: 100%;
                border: none;
                //height: 0;
                //border:2px solid deeppink;
            }
            
            .oembed-photo{
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
h([
  g(".oembed-frame")
], a.prototype, "frame", 2);
h([
  y()
], a.prototype, "value", 2);
a = h([
  E(a.tagName)
], a);
//# sourceMappingURL=oembed-preview.element-CSGYbOax.js.map
