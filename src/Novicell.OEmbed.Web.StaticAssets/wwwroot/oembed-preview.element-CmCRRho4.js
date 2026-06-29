import "./client.gen-DVwspqDp.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as C } from "./oembed.repository-Y4nXUpA8.js";
import { UmbStringState as g, UmbObjectState as p } from "@umbraco-cms/backoffice/observable-api";
import { UmbModalToken as P, umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import { UmbControllerBase as M } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { css as D, property as _, customElement as L, nothing as m, html as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as H } from "@umbraco-cms/backoffice/lit-element";
class R {
  constructor() {
    this.#e = new g(""), this.#i = new p(
      void 0
    ), this.#t = new g("idle"), this.#s = new p(void 0), this.url$ = this.#e.asObservable(), this.preview$ = this.#i.asObservable(), this.loading$ = this.#t.asObservable(), this.error$ = this.#s.asObservable();
  }
  #e;
  #i;
  #t;
  #s;
  /**
   * Update the URL input.
   */
  setUrl(t) {
    this.#e.setValue(t);
  }
  /**
   * Get the current URL value.
   */
  getUrl() {
    return this.#e.value;
  }
  /**
   * Set the preview data (successful fetch).
   */
  setPreview(t) {
    this.#i.setValue(t), this.#s.setValue(void 0), this.#t.setValue("success");
  }
  /**
   * Set an error state.
   */
  setError(t) {
    this.#s.setValue(t), this.#i.setValue(void 0), this.#t.setValue(t ? "error" : "idle");
  }
  /**
   * Set loading state.
   */
  setLoading(t) {
    this.#t.setValue(t ? "loading" : "idle");
  }
  /**
   * Get the current loading state.
   */
  getLoading() {
    return this.#t.value;
  }
  /**
   * Reset all state to initial values.
   */
  reset() {
    this.#e.setValue(""), this.#i.setValue(void 0), this.#s.setValue(void 0), this.#t.setValue("idle");
  }
}
const z = new P(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
class Q extends M {
  constructor(t) {
    super(t), this.#e = new R(), this.#i = new C(this), this.#t = new p(void 0), this.value$ = this.#t.asObservable(), this.url$ = this.#e.url$, this.preview$ = this.#e.preview$, this.loading$ = this.#e.loading$, this.error$ = this.#e.error$;
  }
  #e;
  #i;
  #t;
  /**
   * Update the URL and fetch preview data.
   */
  async updateUrl(t) {
    this.#e.setUrl(t);
  }
  /**
   * Fetch oEmbed preview data for the current URL.
   */
  async fetchPreview(t, i, r) {
    const s = t || this.#e.getUrl();
    if (!s) return;
    this.#e.setLoading(!0);
    const { data: n, error: l } = await this.#i.requestOEmbed({
      url: s,
      maxWidth: i,
      maxHeight: r
    });
    n ? this.#e.setPreview(n) : this.#e.setError(l);
  }
  /**
   * Get the current URL value (for form submission).
   */
  getUrl() {
    return this.#e.getUrl();
  }
  /**
   * Get the current committed picker value.
   */
  getValue() {
    return this.#t.getValue();
  }
  /**
   * Set the committed picker value (e.g. seeding from persisted data).
   */
  setValue(t) {
    this.#t.setValue(t);
  }
  /**
   * Clear the committed picker value.
   */
  clearValue() {
    this.#t.setValue(void 0);
  }
  /**
   * Open the picker modal and commit the chosen value.
   * @param url Optional URL to pre-fill the modal with.
   * @returns The chosen value, or undefined if cancelled.
   */
  async openPicker(t) {
    const i = await S(this, z, {
      data: { url: t }
    }).catch(() => {
    });
    if (!i) return;
    const r = { ...i };
    return this.#t.setValue(r), r;
  }
  /**
   * Reset all state to initial values.
   */
  reset() {
    this.#e.reset(), this.#t.setValue(void 0);
  }
}
const Y = new T("UmbOEmbedPickerContext");
var B = Object.defineProperty, F = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, v = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? F(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (s = (r ? l(t, i, s) : l(s)) || s);
  return r && s && B(t, i, s), s;
}, w = (e, t, i) => t.has(e) || $("Cannot " + i), O = (e, t, i) => (w(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), A = (e, t, i, r) => (w(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (w(e, t, "access private method"), i), d, a, b, E, u, U, f, V, x, k;
let h = class extends H {
  constructor() {
    super(...arguments), y(this, a), this.contain = !1, y(this, d, []);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), o(this, a, b).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), e.has("value") && o(this, a, b).call(this);
  }
  render() {
    const e = this.value;
    return e ? c`${o(this, a, k).call(this, e)}` : m;
  }
};
d = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
b = function() {
  O(this, d).forEach((e) => e.disconnect()), A(this, d, []);
};
E = function(e) {
  return String(e).toLowerCase();
};
u = function(e, t) {
  return e && t ? e / t : 0;
};
U = function(e) {
  const t = e.url ?? e.thumbnailUrl;
  if (!t) return o(this, a, f).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height);
  return c`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : m}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
f = function(e) {
  const t = e.thumbnailUrl;
  if (!t) return m;
  const i = o(this, a, u).call(this, e.thumbnailWidth, e.thumbnailHeight);
  return c`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : m}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
V = function(e) {
  const t = e.html;
  if (!t) return o(this, a, f).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height), r = i > 0, s = window.document.createElement("div");
  s.insertAdjacentHTML("afterbegin", t);
  let n = "<style>html,body{margin:0;padding:0}</style>";
  r && (s.style.width = "100%", s.style.height = "100%", n = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>");
  const l = `<html><head></head><body>${n}${s.outerHTML}</body></html>`;
  return r ? c`<div
        class="oembed-frame"
        style=${`aspect-ratio:${i};`}
      >
        <iframe
          srcdoc=${l}
          class="oembed-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>` : this.contain ? c`<div class="oembed-frame oembed-frame--contained">
        <iframe
          srcdoc=${l}
          class="oembed-media"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>` : c`<div class="oembed-frame oembed-frame--auto">
      <iframe
        srcdoc=${l}
        class="oembed-media oembed-media--auto"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        @load=${o(this, a, x)}
      ></iframe>
    </div>`;
};
x = function(e) {
  const t = e.target;
  let i = null;
  try {
    i = t.contentDocument;
  } catch {
    return;
  }
  const r = i?.body;
  if (!r) return;
  const s = () => {
    const l = r.scrollHeight;
    l > 0 && (t.style.height = `${Math.min(
      l,
      h.maxDynamicHeight
    )}px`);
  };
  s();
  const n = new ResizeObserver(() => s());
  n.observe(r), O(this, d).push(n);
};
k = function(e) {
  switch (o(this, a, E).call(this, e.type)) {
    case "photo":
      return o(this, a, U).call(this, e);
    case "link":
      return o(this, a, f).call(this, e);
    default:
      return o(this, a, V).call(this, e);
  }
};
h.tagName = "oembed-preview";
h.maxDynamicHeight = 600;
h.styles = [
  D`
      :host {
        display: block;
        width: 100%;
      }

      :host([contain]) {
        height: 100%;
        overflow: hidden;
      }

      .oembed-frame {
        position: relative;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        border-radius: var(--uui-border-radius, 3px);
        background-color: var(--uui-color-surface-alt, #f3f3f5);
      }

      .oembed-media {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        object-fit: cover;
      }

      .oembed-frame--auto {
        background-color: transparent;
      }

      .oembed-media--auto {
        height: 150px;
        max-height: ${h.maxDynamicHeight}px;
        object-fit: unset;
      }

      .oembed-frame--contained {
        height: 100%;
      }
    `
];
v([
  _({ attribute: !1 })
], h.prototype, "value", 2);
v([
  _({ type: Boolean, reflect: !0 })
], h.prototype, "contain", 2);
h = v([
  L(h.tagName)
], h);
export {
  Q as U,
  Y as a
};
//# sourceMappingURL=oembed-preview.element-CmCRRho4.js.map
