import "./client.gen-DVwspqDp.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as P } from "./oembed.repository-Cz7f-l89.js";
import { UmbStringState as w, UmbObjectState as g } from "@umbraco-cms/backoffice/observable-api";
import { UmbModalToken as S, umbOpenModal as M } from "@umbraco-cms/backoffice/modal";
import { UmbControllerBase as z } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as L } from "@umbraco-cms/backoffice/context-api";
import { css as T, property as _, customElement as D, nothing as m, html as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as R } from "@umbraco-cms/backoffice/lit-element";
class H {
  constructor() {
    this.#e = new w(""), this.#t = new g(
      void 0
    ), this.#i = new w("idle"), this.#s = new g(void 0), this.url$ = this.#e.asObservable(), this.preview$ = this.#t.asObservable(), this.loading$ = this.#i.asObservable(), this.error$ = this.#s.asObservable();
  }
  #e;
  #t;
  #i;
  #s;
  /**
   * Update the URL input.
   */
  setUrl(t) {
    this.#e.setValue(t), this.#t.setValue(void 0), this.#s.setValue(void 0), this.#i.setValue("idle");
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
    this.#t.setValue(t), this.#s.setValue(void 0), this.#i.setValue("success");
  }
  /**
   * Set an error state.
   */
  setError(t) {
    this.#s.setValue(t), this.#t.setValue(void 0), this.#i.setValue(t ? "error" : "idle");
  }
  /**
   * Set loading state.
   */
  setLoading(t) {
    this.#i.setValue(t ? "loading" : "idle");
  }
  /**
   * Get the current loading state.
   */
  getLoading() {
    return this.#i.value;
  }
  /**
   * Reset all state to initial values.
   */
  reset() {
    this.#e.setValue(""), this.#t.setValue(void 0), this.#s.setValue(void 0), this.#i.setValue("idle");
  }
}
const B = new S(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
class Y extends z {
  constructor(t) {
    super(t), this.#e = new H(), this.#t = new P(this), this.url$ = this.#e.url$, this.preview$ = this.#e.preview$, this.loading$ = this.#e.loading$, this.error$ = this.#e.error$;
  }
  #e;
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
    const { data: n, error: l } = await this.#t.requestOEmbed({
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
   * Open the picker modal and resolve the composed value.
   * @param url Optional URL to pre-fill the modal with.
   * @param allowedTypes Optional oEmbed type restriction; empty/undefined allows any type.
   * @returns The chosen value, or undefined if cancelled.
   */
  async openPicker(t, i) {
    const r = await M(this, B, {
      data: { url: t, allowedTypes: i }
    }).catch(() => {
    });
    if (r)
      return { ...r };
  }
  /**
   * Reset all state to initial values.
   */
  reset() {
    this.#e.reset();
  }
}
const Z = new L("UmbOEmbedPickerContext");
var F = Object.defineProperty, N = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, b = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? N(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (s = (r ? l(t, i, s) : l(s)) || s);
  return r && s && F(t, i, s), s;
}, v = (e, t, i) => t.has(e) || $("Cannot " + i), x = (e, t, i) => (v(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? $("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), A = (e, t, i, r) => (v(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (v(e, t, "access private method"), i), h, a, p, k, u, O, f, E, U, V, C;
let d = class extends R {
  constructor() {
    super(...arguments), y(this, a), this.contain = !1, y(this, h, []);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), o(this, a, p).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), e.has("value") && o(this, a, p).call(this);
  }
  render() {
    const e = this.value;
    return e ? c`${o(this, a, C).call(this, e)}` : m;
  }
};
h = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
p = function() {
  x(this, h).forEach((e) => e.disconnect()), A(this, h, []);
};
k = function(e) {
  return String(e).toLowerCase();
};
u = function(e, t) {
  return e && t ? e / t : 0;
};
O = function(e) {
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
  if (!t) return o(this, a, E).call(this, e);
  const i = o(this, a, u).call(this, e.thumbnailWidth, e.thumbnailHeight);
  return c`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : m}
    >
      <img class="oembed-media" src=${t} alt=${e.title ?? ""} />
    </div>`;
};
E = function(e) {
  const t = e.url ?? void 0;
  let i = e.providerName ?? "";
  if (!i && t)
    try {
      i = new URL(t).hostname;
    } catch {
    }
  return c`<div class="oembed-link-card">
      <uui-icon name="icon-link"></uui-icon>
      <div class="oembed-link-info">
        <span class="oembed-link-title">${e.title ?? t ?? ""}</span>
        ${i ? c`<span class="oembed-link-host">${i}</span>` : m}
      </div>
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
  n.observe(r), x(this, h).push(n);
};
C = function(e) {
  switch (o(this, a, k).call(this, e.type)) {
    case "photo":
      return o(this, a, O).call(this, e);
    case "link":
      return o(this, a, f).call(this, e);
    default:
      return o(this, a, U).call(this, e);
  }
};
d.tagName = "oembed-preview";
d.maxDynamicHeight = 600;
d.styles = [
  T`
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

      .oembed-link-card {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-4);
        padding: var(--uui-size-space-4);
        border-radius: var(--uui-border-radius, 3px);
        background-color: var(--uui-color-surface-alt, #f3f3f5);
        overflow: hidden;
      }

      .oembed-link-card uui-icon {
        flex: none;
        font-size: var(--uui-size-6);
        color: var(--uui-color-text-alt);
      }

      .oembed-link-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .oembed-link-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .oembed-link-host {
        font-size: var(--uui-type-small-size);
        color: var(--uui-color-text-alt);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
];
b([
  _({ attribute: !1 })
], d.prototype, "value", 2);
b([
  _({ type: Boolean, reflect: !0 })
], d.prototype, "contain", 2);
d = b([
  D(d.tagName)
], d);
export {
  Y as U,
  Z as a
};
//# sourceMappingURL=oembed-preview.element-iCC-NFVm.js.map
