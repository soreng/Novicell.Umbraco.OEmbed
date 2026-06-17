import "./client.gen-DVwspqDp.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as P } from "./oembed.repository-Y4nXUpA8.js";
import { UmbStringState as g, UmbObjectState as p } from "@umbraco-cms/backoffice/observable-api";
import { UmbModalToken as M, umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import { UmbControllerBase as T } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as D } from "@umbraco-cms/backoffice/context-api";
import { css as L, property as y, customElement as z, nothing as h, html as c } from "@umbraco-cms/backoffice/external/lit";
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
const B = new M(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
class Y extends T {
  constructor(t) {
    super(t), this.#e = new R(), this.#i = new P(this), this.#t = new p(void 0), this.value$ = this.#t.asObservable(), this.url$ = this.#e.url$, this.preview$ = this.#e.preview$, this.loading$ = this.#e.loading$, this.error$ = this.#e.error$;
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
    const i = await S(this, B, {
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
const Z = new D(
  "UmbOEmbedPickerContext"
);
var N = Object.defineProperty, F = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, v = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? F(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (s = (r ? l(t, i, s) : l(s)) || s);
  return r && s && N(t, i, s), s;
}, w = (e, t, i) => t.has(e) || $("Cannot " + i), x = (e, t, i) => (w(e, t, "read from private field"), i ? i.call(e) : t.get(e)), _ = (e, t, i) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), A = (e, t, i, r) => (w(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (w(e, t, "access private method"), i), m, a, b, O, u, E, f, U, V, k, C;
let d = class extends H {
  constructor() {
    super(...arguments), _(this, a), this.contain = !1, _(this, m, []);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), o(this, a, b).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), e.has("value") && o(this, a, b).call(this);
  }
  render() {
    const e = this.value;
    return e ? c`${o(this, a, C).call(this, e)}${this.contain ? h : o(this, a, k).call(this, e)}` : h;
  }
};
m = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
b = function() {
  x(this, m).forEach((e) => e.disconnect()), A(this, m, []);
};
O = function(e) {
  return String(e).toLowerCase();
};
u = function(e, t) {
  return e && t ? e / t : 0;
};
E = function(e) {
  const t = e.url ?? e.thumbnailUrl;
  if (!t) return o(this, a, f).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height);
  return c`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : h}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
f = function(e) {
  const t = e.thumbnailUrl;
  if (!t) return h;
  const i = o(this, a, u).call(this, e.thumbnailWidth, e.thumbnailHeight);
  return c`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : h}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
U = function(e) {
  const t = e.html;
  if (!t) return o(this, a, f).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height), r = i > 0, s = window.document.createElement("div");
  s.insertAdjacentHTML("afterbegin", t);
  let n = "<style>html,body{margin:0;padding:0}</style>";
  r && (s.style.width = "100%", s.style.height = "100%", n = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>");
  const l = `<html><head></head><body>${n}${s.outerHTML}</body></html>`;
  return r ? c`<div class="oembed-frame" style=${`aspect-ratio:${i};`}>
        <iframe
          srcdoc=${l}
          class="oembed-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>` : this.contain ? c`<div class="oembed-frame oembed-frame--contained">
        <iframe
          srcdoc=${l}
          class="oembed-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>` : c`<div class="oembed-frame oembed-frame--auto">
      <iframe
        srcdoc=${l}
        class="oembed-media oembed-media--auto"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        @load=${o(this, a, V)}
      ></iframe>
    </div>`;
};
V = function(e) {
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
      d.maxDynamicHeight
    )}px`);
  };
  s();
  const n = new ResizeObserver(() => s());
  n.observe(r), x(this, m).push(n);
};
k = function(e) {
  const t = [e.providerName, e.authorName].filter(Boolean).join(" · ");
  return !e.title && !t ? h : c`<div class="oembed-meta">
      ${e.title ? c`<span class="oembed-meta__title" title=${e.title}
            >${e.title}</span
          >` : h}
      ${t ? c`<small class="oembed-meta__detail">${t}</small>` : h}
    </div>`;
};
C = function(e) {
  switch (o(this, a, O).call(this, e.type)) {
    case "photo":
      return o(this, a, E).call(this, e);
    case "link":
      return o(this, a, f).call(this, e);
    default:
      return o(this, a, U).call(this, e);
  }
};
d.tagName = "oembed-preview";
d.maxDynamicHeight = 600;
d.styles = [
  L`
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
        max-height: ${d.maxDynamicHeight}px;
        object-fit: unset;
      }

      .oembed-frame--contained {
        height: 100%;
      }

      .oembed-meta {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-1, 3px);
        padding-top: var(--uui-size-space-2, 6px);
      }

      .oembed-meta__title {
        font-weight: var(--uui-font-weight-bold, 700);
        color: var(--uui-color-text, #1b264f);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .oembed-meta__detail {
        color: var(--uui-color-text-alt, #515763);
      }
    `
];
v([
  y({ attribute: !1 })
], d.prototype, "value", 2);
v([
  y({ type: Boolean, reflect: !0 })
], d.prototype, "contain", 2);
d = v([
  z(d.tagName)
], d);
export {
  Y as U,
  Z as a
};
//# sourceMappingURL=oembed-preview.element-CyT_Ma1Y.js.map
