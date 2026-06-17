import { when as A, html as u, nothing as $, css as S, property as p, customElement as w, state as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as O } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as W } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as P, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as q } from "@umbraco-cms/backoffice/validation";
import { umbConfirmModal as D } from "@umbraco-cms/backoffice/modal";
import { U as L, a as H } from "./oembed-preview.element-B40iok3S.js";
var Y = Object.defineProperty, K = Object.getOwnPropertyDescriptor, M = (e) => {
  throw TypeError(e);
}, _ = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? K(t, a) : t, h = e.length - 1, c; h >= 0; h--)
    (c = e[h]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && Y(t, a, i), i;
}, k = (e, t, a) => t.has(e) || M("Cannot " + a), v = (e, t, a) => (k(e, t, "read from private field"), a ? a.call(e) : t.get(e)), b = (e, t, a) => t.has(e) ? M("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), n = (e, t, a) => (k(e, t, "access private method"), a), d, r, y, g, I, x, U, B, R, N, T;
let l = class extends P(O) {
  constructor() {
    super(), b(this, r), b(this, d, new L(this)), this.provideContext(H, v(this, d));
  }
  connectedCallback() {
    super.connectedCallback(), this.value && v(this, d).setValue(this.value), this.observe(
      v(this, d).value$,
      (e) => {
        e !== this.value && (this.value = e, this.dispatchEvent(new C()));
      },
      "_oembedPickerValue"
    );
  }
  async requestRemoveItem(e) {
    const t = e.oembed.title || e.url;
    await D(this, {
      color: "danger",
      headline: `#actions_remove ${t}?`,
      content: `#defaultdialogs_confirmremove ${t}?`,
      confirmLabel: "#actions_remove"
    });
  }
  render() {
    const e = n(this, r, y).call(this, this.value);
    return u`<div class="container">
      ${A(
      e,
      () => n(this, r, N).call(this, this.value),
      () => n(this, r, T).call(this)
    )}
    </div>`;
  }
};
d = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return !!(e?.url && e?.oembed?.type);
};
g = async function(e) {
  await v(this, d).openPicker(e);
};
I = async function() {
  try {
    await this.requestRemoveItem(this.value), v(this, d).clearValue();
  } catch {
  }
};
x = function() {
  return this.readonly ? $ : u`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => n(this, r, I).call(this)}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
};
U = function(e) {
  return [e.providerName, e.authorName].filter(Boolean).join(" · ");
};
B = function(e) {
  if (e.width && e.height)
    return `${e.width} / ${e.height}`;
  if (e.thumbnailWidth && e.thumbnailHeight)
    return `${e.thumbnailWidth} / ${e.thumbnailHeight}`;
  switch (e.type?.toLowerCase()) {
    case "video":
      return "16 / 9";
    case "photo":
      return "4 / 3";
    // TODO: determine sensible fallbacks for "rich" and "link" once those
    // types are reviewed; defaulting to 16:9 for now.
    default:
      return "16 / 9";
  }
};
R = function(e) {
  return e.oembed.thumbnailUrl ? u`<img
        src=${e.oembed.thumbnailUrl}
        alt=${e.oembed.title ?? e.url}
      />` : u`<oembed-preview
      contain
      .value="${e.oembed}"
    ></oembed-preview>`;
};
N = function(e) {
  return u`
      <uui-card-media
        style=${`aspect-ratio: ${n(this, r, B).call(this, e.oembed)}`}
        .name=${e.oembed.title ?? e.url}
        .detail=${n(this, r, U).call(this, e.oembed)}
        .selectonly="true"
        .selectable="false"
        @open="${() => n(this, r, g).call(this, e.url)}"
        ?readonly=${this.readonly}
      >
        ${n(this, r, R).call(this, e)} ${n(this, r, x).call(this)}
      </uui-card-media>
    `;
};
T = function() {
  return this.readonly || n(this, r, y).call(this, this.value) ? $ : u`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${() => n(this, r, g).call(this)}
        label=${this.localize.term("general_choose")}
        ?disabled=${this.readonly}
      >
        <uui-icon name="icon-add"></uui-icon>
        ${this.localize.term("general_choose")}
      </uui-button>
    `;
};
l.tagName = "input-oembed";
l.styles = [
  S`
      :host {
        position: relative;
      }

      .container {
        display: grid;
        gap: var(--uui-size-space-5);
        grid-template-columns: minmax(
          var(--umb-card-medium-min-width),
          var(--umb-card-large-min-width)
        );
        grid-auto-rows: auto;
      }

      #btn-add {
        text-align: center;
        height: 100%;
      }

      uui-icon {
        display: block;
        margin: 0 auto;
      }

      uui-card-media umb-icon {
        font-size: var(--uui-size-8);
      }

      uui-card-media[drag-placeholder] {
        opacity: 0.2;
      }

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
        background-size: 10px 10px;
        background-repeat: repeat;
      }
    `
];
_([
  p({ type: Boolean })
], l.prototype, "required", 2);
_([
  p({ type: String })
], l.prototype, "requiredMessage", 2);
_([
  p({ type: Boolean, reflect: !0 })
], l.prototype, "readonly", 2);
l = _([
  w(l.tagName)
], l);
var X = Object.defineProperty, F = Object.getOwnPropertyDescriptor, V = (e) => {
  throw TypeError(e);
}, m = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? F(t, a) : t, h = e.length - 1, c; h >= 0; h--)
    (c = e[h]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && X(t, a, i), i;
}, G = (e, t, a) => t.has(e) || V("Cannot " + a), Z = (e, t, a) => t.has(e) ? V("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), j = (e, t, a) => (G(e, t, "access private method"), a), f, z;
let s = class extends P(O) {
  constructor() {
    super(), Z(this, f), this.mandatoryMessage = q, this.readonly = !1, this.consumeContext(W, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(
        e?.variantId,
        (t) => this._variantId = t?.toString() || "invariant"
      );
    });
  }
  render() {
    return u`
      <input-oembed
        .alias=${this._alias}
        .value=${this.value}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        @change=${j(this, f, z)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
f = /* @__PURE__ */ new WeakSet();
z = function(e) {
  const t = e.target.value === void 0;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new C());
};
s.tagName = "oembed-property-editor";
m([
  p({ type: Boolean })
], s.prototype, "mandatory", 2);
m([
  p({ type: String })
], s.prototype, "mandatoryMessage", 2);
m([
  p({ type: Boolean, reflect: !0 })
], s.prototype, "readonly", 2);
m([
  E()
], s.prototype, "_alias", 2);
m([
  E()
], s.prototype, "_variantId", 2);
s = m([
  w(s.tagName)
], s);
export {
  s as default,
  s as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-CISX4mBS.js.map
