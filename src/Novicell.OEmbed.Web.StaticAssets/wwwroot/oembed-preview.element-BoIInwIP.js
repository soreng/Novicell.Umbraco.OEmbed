import "./client.gen-DVwspqDp.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as C } from "./oembed.repository-Y4nXUpA8.js";
import { UmbStringState as w, UmbObjectState as f } from "@umbraco-cms/backoffice/observable-api";
import { UmbModalToken as P, umbOpenModal as M } from "@umbraco-cms/backoffice/modal";
import { UmbControllerBase as S } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { css as D, property as L, customElement as z, nothing as c, html as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as H } from "@umbraco-cms/backoffice/lit-element";
class R {
  constructor() {
    this.#e = new w(""), this.#i = new f(
      void 0
    ), this.#t = new w("idle"), this.#s = new f(void 0), this.url$ = this.#e.asObservable(), this.preview$ = this.#i.asObservable(), this.loading$ = this.#t.asObservable(), this.error$ = this.#s.asObservable();
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
const N = new P(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
class Y extends S {
  constructor(t) {
    super(t), this.#e = new R(), this.#i = new C(this), this.#t = new f(void 0), this.value$ = this.#t.asObservable(), this.url$ = this.#e.url$, this.preview$ = this.#e.preview$, this.loading$ = this.#e.loading$, this.error$ = this.#e.error$;
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
    const { data: l, error: n } = await this.#i.requestOEmbed({
      url: s,
      maxWidth: i,
      maxHeight: r
    });
    l ? this.#e.setPreview(l) : this.#e.setError(n);
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
    const i = await M(this, N, {
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
const Z = new T(
  "UmbOEmbedPickerContext"
);
var B = Object.defineProperty, F = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, y = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? F(t, i) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (s = (r ? n(t, i, s) : n(s)) || s);
  return r && s && B(t, i, s), s;
}, v = (e, t, i) => t.has(e) || _("Cannot " + i), $ = (e, t, i) => (v(e, t, "read from private field"), i ? i.call(e) : t.get(e)), g = (e, t, i) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), A = (e, t, i, r) => (v(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (v(e, t, "access private method"), i), m, a, b, O, u, x, p, E, U, V, k;
let d = class extends H {
  constructor() {
    super(...arguments), g(this, a), g(this, m, []);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), o(this, a, b).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), e.has("value") && o(this, a, b).call(this);
  }
  render() {
    const e = this.value;
    return e ? h`${o(this, a, k).call(this, e)}${o(this, a, V).call(this, e)}` : c;
  }
};
m = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
b = function() {
  $(this, m).forEach((e) => e.disconnect()), A(this, m, []);
};
O = function(e) {
  return String(e).toLowerCase();
};
u = function(e, t) {
  return e && t ? e / t : 0;
};
x = function(e) {
  const t = e.url ?? e.thumbnailUrl;
  if (!t) return o(this, a, p).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height);
  return h`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : c}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
p = function(e) {
  const t = e.thumbnailUrl;
  if (!t) return c;
  const i = o(this, a, u).call(this, e.thumbnailWidth, e.thumbnailHeight);
  return h`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : c}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
E = function(e) {
  const t = e.html;
  if (!t) return o(this, a, p).call(this, e);
  const i = o(this, a, u).call(this, e.width, e.height), r = i > 0, s = window.document.createElement("div");
  s.insertAdjacentHTML("afterbegin", t);
  let l = "<style>html,body{margin:0;padding:0}</style>";
  r && (s.style.width = "100%", s.style.height = "100%", l = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>");
  const n = `<html><head></head><body>${l}${s.outerHTML}</body></html>`;
  return r ? h`<div class="oembed-frame" style=${`aspect-ratio:${i};`}>
        <iframe
          srcdoc=${n}
          class="oembed-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>` : h`<div class="oembed-frame oembed-frame--auto">
      <iframe
        srcdoc=${n}
        class="oembed-media oembed-media--auto"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        @load=${o(this, a, U)}
      ></iframe>
    </div>`;
};
U = function(e) {
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
    const n = r.scrollHeight;
    n > 0 && (t.style.height = `${Math.min(
      n,
      d.maxDynamicHeight
    )}px`);
  };
  s();
  const l = new ResizeObserver(() => s());
  l.observe(r), $(this, m).push(l);
};
V = function(e) {
  const t = [e.providerName, e.authorName].filter(Boolean).join(" · ");
  return !e.title && !t ? c : h`<div class="oembed-meta">
      ${e.title ? h`<span class="oembed-meta__title" title=${e.title}
            >${e.title}</span
          >` : c}
      ${t ? h`<small class="oembed-meta__detail">${t}</small>` : c}
    </div>`;
};
k = function(e) {
  switch (o(this, a, O).call(this, e.type)) {
    case "photo":
      return o(this, a, x).call(this, e);
    case "link":
      return o(this, a, p).call(this, e);
    default:
      return o(this, a, E).call(this, e);
  }
};
d.tagName = "oembed-preview";
d.maxDynamicHeight = 600;
d.styles = [
  D`
      :host {
        display: block;
        width: 100%;
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
y([
  L({ attribute: !1 })
], d.prototype, "value", 2);
d = y([
  z(d.tagName)
], d);
export {
  Y as U,
  Z as a
};
//# sourceMappingURL=oembed-preview.element-BoIInwIP.js.map
