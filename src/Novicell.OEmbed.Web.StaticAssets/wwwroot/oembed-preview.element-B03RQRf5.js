import { css as y, property as $, customElement as x, nothing as n, html as l } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
var C = Object.defineProperty, O = Object.getOwnPropertyDescriptor, p = (t) => {
  throw TypeError(t);
}, u = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? O(e, i) : e, c = t.length - 1, f; c >= 0; c--)
    (f = t[c]) && (s = (o ? f(e, i, s) : f(s)) || s);
  return o && s && C(e, i, s), s;
}, P = (t, e, i) => e.has(t) || p("Cannot " + i), T = (t, e, i) => e.has(t) ? p("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), a = (t, e, i) => (P(t, e, "access private method"), i), r, b, h, _, m, w, v, g;
let d = class extends E {
  constructor() {
    super(...arguments), T(this, r);
  }
  render() {
    const t = this.value;
    return t ? l`${a(this, r, g).call(this, t)}${a(this, r, v).call(this, t)}` : n;
  }
};
r = /* @__PURE__ */ new WeakSet();
b = function(t) {
  return String(t).toLowerCase();
};
h = function(t, e) {
  return t && e ? t / e : 0;
};
_ = function(t) {
  const e = t.url ?? t.thumbnailUrl;
  if (!e) return a(this, r, m).call(this, t);
  const i = a(this, r, h).call(this, t.width, t.height);
  return l`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : n}
    >
      <img class="oembed-media" src=${e} alt=${t.title ?? ""} />
    </div>`;
};
m = function(t) {
  const e = t.thumbnailUrl;
  if (!e) return n;
  const i = a(this, r, h).call(this, t.thumbnailWidth, t.thumbnailHeight);
  return l`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : n}
    >
      <img class="oembed-media" src=${e} alt=${t.title ?? ""} />
    </div>`;
};
w = function(t) {
  const e = t.html;
  if (!e) return a(this, r, m).call(this, t);
  const i = a(this, r, h).call(this, t.width, t.height), o = window.document.createElement("div");
  o.insertAdjacentHTML("afterbegin", e);
  let s = "";
  i > 0 && (o.style.width = "100%", o.style.height = "100%", s = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>");
  const c = `<html><head></head><body>${s}${o.outerHTML}</body></html>`;
  return l`<div
      class="oembed-frame"
      style=${i > 0 ? `aspect-ratio:${i};` : n}
    >
      <iframe
        srcdoc=${c}
        class="oembed-media"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>
    </div>`;
};
v = function(t) {
  const e = [t.providerName, t.authorName].filter(Boolean).join(" · ");
  return !t.title && !e ? n : l`<div class="oembed-meta">
      ${t.title ? l`<span class="oembed-meta__title" title=${t.title}
            >${t.title}</span
          >` : n}
      ${e ? l`<small class="oembed-meta__detail">${e}</small>` : n}
    </div>`;
};
g = function(t) {
  switch (a(this, r, b).call(this, t.type)) {
    case "photo":
      return a(this, r, _).call(this, t);
    case "link":
      return a(this, r, m).call(this, t);
    default:
      return a(this, r, w).call(this, t);
  }
};
d.tagName = "oembed-preview";
d.styles = [
  y`
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
u([
  $({ attribute: !1 })
], d.prototype, "value", 2);
d = u([
  x(d.tagName)
], d);
//# sourceMappingURL=oembed-preview.element-B03RQRf5.js.map
