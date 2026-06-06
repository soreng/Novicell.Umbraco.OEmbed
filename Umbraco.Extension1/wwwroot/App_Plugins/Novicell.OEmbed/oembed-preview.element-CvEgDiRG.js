import { css as b, property as g, customElement as y, nothing as E, when as x, html as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as M } from "@umbraco-cms/backoffice/lit-element";
var O = Object.defineProperty, P = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, u = (e, t, o, i) => {
  for (var r = i > 1 ? void 0 : i ? P(t, o) : t, a = e.length - 1, s; a >= 0; a--)
    (s = e[a]) && (r = (i ? s(t, o, r) : s(r)) || r);
  return i && r && O(t, o, r), r;
}, w = (e, t, o) => t.has(e) || v("Cannot " + o), h = (e, t, o) => (w(e, t, "read from private field"), o ? o.call(e) : t.get(e)), c = (e, t, o) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), p = (e, t, o) => (w(e, t, "access private method"), o), d, l, f, _;
let n = class extends M {
  constructor() {
    super(...arguments), c(this, l), c(this, d, new MutationObserver((e, t) => {
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
    this.shadowRoot.w && h(this, d).observe(this, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      characterData: !0
    }), super.updated(e);
  }
  shouldUpdate(e) {
  }
  onMutation(e, t) {
    console.log("mutation", e, t);
  }
  render() {
    const e = this.value;
    return e === void 0 ? E : x(
      e.type == "photo",
      () => p(this, l, f).call(this, e.url, e.width, e.height),
      () => p(this, l, _).call(this, e.html, e.width, e.height)
    );
  }
};
d = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
f = function(e, t, o) {
  return m`<img 
                class="oembed-photo"
                src="${e}"
                width="${t}"
                height="${o}"/>`;
};
_ = function(e, t, o) {
  h(this, d).takeRecords(), h(this, d).disconnect();
  const i = t && o ? t / o : 0;
  var r = window.document.createElement("div");
  r.insertAdjacentHTML("afterbegin", e);
  let a = "";
  i > 0 && (r.style.width = "100%", r.style.height = "100%", a = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow: hidden}</style>");
  const s = `<html><head></head><body>${a}${r.outerHTML}</body></html>`;
  return m`
            <iframe
                    srcdoc="${s}"
                    class="oembed-frame"
                    style="${i > 0 ? "aspect-ratio:" + i + ";" : ""}"
                    sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>`;
};
n.tagName = "oembed-preview";
n.styles = [
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
u([
  g()
], n.prototype, "value", 2);
n = u([
  y(n.tagName)
], n);
//# sourceMappingURL=oembed-preview.element-CvEgDiRG.js.map
