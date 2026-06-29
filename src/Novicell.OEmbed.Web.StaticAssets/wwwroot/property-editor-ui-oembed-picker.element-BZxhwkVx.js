import { when as S, html as u, nothing as w, css as W, property as p, customElement as $, state as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as C } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as O } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as q } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as P, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as D } from "@umbraco-cms/backoffice/validation";
import { umbConfirmModal as L } from "@umbraco-cms/backoffice/modal";
import { U as V, a as H } from "./oembed-preview.element-CmCRRho4.js";
var Y = Object.defineProperty, K = Object.getOwnPropertyDescriptor, M = (e) => {
  throw TypeError(e);
}, f = (e, t, i, n) => {
  for (var a = n > 1 ? void 0 : n ? K(t, i) : t, h = e.length - 1, c; h >= 0; h--)
    (c = e[h]) && (a = (n ? c(t, i, a) : c(a)) || a);
  return n && a && Y(t, i, a), a;
}, k = (e, t, i) => t.has(e) || M("Cannot " + i), v = (e, t, i) => (k(e, t, "read from private field"), i ? i.call(e) : t.get(e)), b = (e, t, i) => t.has(e) ? M("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), o = (e, t, i) => (k(e, t, "access private method"), i), d, r, g, y, x, I, U, B, N, T, z;
let l = class extends P(O) {
  constructor() {
    super(), b(this, r), b(this, d, new V(this)), this.provideContext(H, v(this, d));
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
    await L(this, {
      color: "danger",
      headline: `#actions_remove ${t}?`,
      content: `#defaultdialogs_confirmremove ${t}?`,
      confirmLabel: "#actions_remove"
    });
  }
  render() {
    return u`<div class="container">
      ${S(o(this, r, g).call(this, this.value), () => o(this, r, T).call(this, this.value))}
      ${o(this, r, z).call(this)}
    </div>`;
  }
};
d = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
g = function(e) {
  return !!(e?.url && e?.oembed?.type);
};
y = async function(e) {
  await v(this, d).openPicker(e);
};
x = async function() {
  try {
    await this.requestRemoveItem(this.value), v(this, d).clearValue();
  } catch {
  }
};
I = function() {
  return this.readonly ? w : u`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => o(this, r, x).call(this)}
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
  if (e.thumbnailWidth && e.thumbnailHeight)
    return { width: e.thumbnailWidth, height: e.thumbnailHeight };
  if (e.width && e.height)
    return { width: e.width, height: e.height };
  switch (e.type?.toLowerCase()) {
    case "photo":
      return { width: 4, height: 3 };
    // TODO: determine sensible fallbacks for "rich" and "link" once those
    // types are reviewed; defaulting to 16:9 for now.
    case "video":
    default:
      return { width: 16, height: 9 };
  }
};
N = function(e) {
  return e.oembed.thumbnailUrl ? u`<img
        src=${e.oembed.thumbnailUrl}
        alt=${e.oembed.title ?? e.url}
      />` : u`<oembed-preview
      contain
      .value="${e.oembed}"
    ></oembed-preview>`;
};
T = function(e) {
  const { width: t, height: i } = o(this, r, B).call(this, e.oembed), n = t && i ? t / i : 0;
  return u`
      <uui-card-media
        style=${n >= 1 && n < 2 ? `aspect-ratio: ${t} / ${i}` : ""}
        .name=${e.oembed.title ?? e.url}
        .detail=${o(this, r, U).call(this, e.oembed)}
        .selectonly="true"
        .selectable="false"
        @open="${() => o(this, r, y).call(this, e.url)}"
        ?readonly=${this.readonly}
      >
        ${o(this, r, N).call(this, e)} ${o(this, r, I).call(this)}
      </uui-card-media>
    `;
};
z = function() {
  return this.readonly || o(this, r, g).call(this, this.value) ? w : u`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${() => o(this, r, y).call(this)}
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
  W`
      :host {
        position: relative;
      }

      .container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-5);
        align-items: flex-start;
        min-height: var(--umb-card-medium-min-width);
      }

      uui-card-media {
        height: var(--umb-card-medium-min-width);
        width: auto;
        /* aspect-ratio set inline per card */
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
f([
  p({ type: Boolean })
], l.prototype, "required", 2);
f([
  p({ type: String })
], l.prototype, "requiredMessage", 2);
f([
  p({ type: Boolean, reflect: !0 })
], l.prototype, "readonly", 2);
l = f([
  $(l.tagName)
], l);
var X = Object.defineProperty, F = Object.getOwnPropertyDescriptor, A = (e) => {
  throw TypeError(e);
}, m = (e, t, i, n) => {
  for (var a = n > 1 ? void 0 : n ? F(t, i) : t, h = e.length - 1, c; h >= 0; h--)
    (c = e[h]) && (a = (n ? c(t, i, a) : c(a)) || a);
  return n && a && X(t, i, a), a;
}, G = (e, t, i) => t.has(e) || A("Cannot " + i), Z = (e, t, i) => t.has(e) ? A("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), j = (e, t, i) => (G(e, t, "access private method"), i), _, R;
let s = class extends P(O) {
  constructor() {
    super(), Z(this, _), this.mandatoryMessage = D, this.readonly = !1, this.consumeContext(q, (e) => {
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
        @change=${j(this, _, R)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
_ = /* @__PURE__ */ new WeakSet();
R = function(e) {
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
  $(s.tagName)
], s);
export {
  s as default,
  s as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-BZxhwkVx.js.map
