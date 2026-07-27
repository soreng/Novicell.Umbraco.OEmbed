import { html as p, nothing as v, css as V, property as h, customElement as $, state as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as g } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as x } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as L } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as E, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as M } from "@umbraco-cms/backoffice/validation";
import { umbConfirmModal as W } from "@umbraco-cms/backoffice/modal";
import { U as D, a as H } from "./oembed-preview.element-iCC-NFVm.js";
var Y = Object.defineProperty, F = Object.getOwnPropertyDescriptor, P = (e) => {
  throw TypeError(e);
}, u = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? F(t, i) : t, c = e.length - 1, m; c >= 0; c--)
    (m = e[c]) && (a = (r ? m(t, i, a) : m(a)) || a);
  return r && a && Y(t, i, a), a;
}, C = (e, t, i) => t.has(e) || P("Cannot " + i), O = (e, t, i) => (C(e, t, "read from private field"), i ? i.call(e) : t.get(e)), b = (e, t, i) => t.has(e) ? P("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), l = (e, t, i) => (C(e, t, "access private method"), i), f, s, w, T, k, z, U, A, B, I, N, q;
let n = class extends E(x) {
  constructor() {
    super(), b(this, s), this.multiple = !1, b(this, f, new D(this)), this.provideContext(H, O(this, f)), this.addValidator(
      "valueMissing",
      () => this.requiredMessage ?? M,
      () => !this.readonly && !!this.required && this.value.length === 0
    ), this.addValidator(
      "rangeUnderflow",
      () => this.localize.term(
        "validation_entriesShort",
        this.min,
        (this.min ?? 0) - this.value.length
      ),
      () => !this.readonly && !!this.min && this.value.length < this.min
    ), this.addValidator(
      "rangeOverflow",
      () => this.localize.term(
        "validation_entriesExceed",
        this.max,
        this.value.length - (this.max ?? 0)
      ),
      () => !this.readonly && !!this.max && this.value.length > this.max
    );
  }
  get value() {
    return super.value ?? [];
  }
  set value(e) {
    e ? Array.isArray(e) ? super.value = e : super.value = [e] : super.value = [];
  }
  async requestRemoveItem(e) {
    const t = e.oembed.title || e.url;
    await W(this, {
      color: "danger",
      headline: `#actions_remove ${t}?`,
      content: `#defaultdialogs_confirmremove ${t}?`,
      confirmLabel: "#actions_remove"
    });
  }
  render() {
    const e = this.value.length === 0;
    return p`<div class="container ${e ? "container--empty" : ""}">
      ${l(this, s, N).call(this)} ${l(this, s, q).call(this)}
    </div>`;
  }
};
f = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
w = async function(e, t) {
  const i = await O(this, f).openPicker(e, this.allowedTypes);
  if (!i) return;
  const r = [...this.value];
  t !== void 0 ? r[t] = i : r.push(i), this.value = r, this.dispatchEvent(new g());
};
T = async function(e) {
  try {
    await this.requestRemoveItem(this.value[e]);
    const t = [...this.value];
    t.splice(e, 1), this.value = t, this.dispatchEvent(new g());
  } catch {
  }
};
k = function(e) {
  return this.readonly ? v : p`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => l(this, s, T).call(this, e)}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
};
z = function(e) {
  return [e.providerName, e.authorName].filter(Boolean).join(" · ");
};
U = function(e) {
  if (e.thumbnailWidth && e.thumbnailHeight)
    return { width: e.thumbnailWidth, height: e.thumbnailHeight };
  if (e.width && e.height)
    return { width: e.width, height: e.height };
  switch (e.type?.toLowerCase()) {
    case "video":
      return { width: 16, height: 9 };
    case "rich":
    case "link":
      return { width: 21, height: 9 };
    case "photo":
    default:
      return { width: 4, height: 3 };
  }
};
A = function(e) {
  return e.oembed.thumbnailUrl ? p`<img
        src=${e.oembed.thumbnailUrl}
        alt=${e.oembed.title ?? e.url}
      />` : p`<oembed-preview
      contain
      .value="${e.oembed}"
    ></oembed-preview>`;
};
B = function(e) {
  return !this.allowedTypes?.length || this.allowedTypes.includes(e.oembed.type);
};
I = function(e, t) {
  const { width: i, height: r } = l(this, s, U).call(this, e.oembed), a = i && r ? i / r : 0;
  return p`
      <uui-card-media
        style=${a >= 1 && a <= 3 ? `aspect-ratio: ${i} / ${r}` : ""}
        .name=${e.oembed.title}
        .detail=${l(this, s, z).call(this, e.oembed)}
        .selectonly="true"
        .selectable="false"
        @open="${() => l(this, s, w).call(this, e.url, t)}"
        ?readonly=${this.readonly}
        ?error=${!l(this, s, B).call(this, e)}
      >
        ${l(this, s, A).call(this, e)} ${l(this, s, k).call(this, t)}
      </uui-card-media>
    `;
};
N = function() {
  return this.value.map((e, t) => l(this, s, I).call(this, e, t));
};
q = function() {
  return this.readonly ? v : !this.multiple && this.value.length >= 1 ? v : this.max && this.value.length >= this.max ? v : p`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${() => l(this, s, w).call(this, "")}
        label=${this.localize.term("general_choose")}
        ?disabled=${this.readonly}
      >
        <uui-icon name="icon-add"></uui-icon>
        ${this.localize.term("general_choose")}
      </uui-button>
    `;
};
n.tagName = "input-oembed";
n.styles = [
  V`
      :host {
        position: relative;
      }

      /*
       * .container holds zero or more cards plus (optionally) the add-button.
       * Populated: flex-wrap, each card sized by its own aspect-ratio + fixed
       * row height, so cards of any ratio (16:9 video, 1:1 photo, etc.) keep
       * their natural size; the add-button (if shown) is just one more flex
       * item, sized as a fixed square cell.
       * Empty: fall back to Umbraco's own placeholder grid (auto-fill/minmax/
       * 1fr, same as Media Picker/Rich Media) so the lone add-button matches
       * their sizing exactly.
       */
      .container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-5);
        align-items: flex-start;
      }

      .container--empty {
        display: grid;
        grid-template-columns: repeat(
          auto-fill,
          minmax(var(--umb-card-medium-min-width), 1fr)
        );
        grid-auto-rows: var(--umb-card-medium-min-width);
      }

      uui-card-media {
        height: var(--umb-card-medium-min-width);
        width: auto;
        /* aspect-ratio override inline per card */
        aspect-ratio: 1/1;
      }

      #btn-add {
        text-align: center;
        /* Populated (flex) state: a fixed square cell, same size as a card's row height. */
        height: var(--umb-card-medium-min-width);
        width: var(--umb-card-medium-min-width);
      }

      .container--empty #btn-add {
        /* Empty (grid) state: fill the auto-fill/minmax(...)/1fr track exactly,
           matching Umbraco's Media Picker/Rich Media placeholder pixel-for-pixel. */
        height: 100%;
        width: 100%;
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
u([
  h({ type: Boolean })
], n.prototype, "required", 2);
u([
  h({ type: String })
], n.prototype, "requiredMessage", 2);
u([
  h({ type: Boolean })
], n.prototype, "multiple", 2);
u([
  h({ type: Number })
], n.prototype, "min", 2);
u([
  h({ type: Number })
], n.prototype, "max", 2);
u([
  h({ type: Array })
], n.prototype, "allowedTypes", 2);
u([
  h({ type: Boolean, reflect: !0 })
], n.prototype, "readonly", 2);
n = u([
  $(n.tagName)
], n);
var K = Object.defineProperty, X = Object.getOwnPropertyDescriptor, R = (e) => {
  throw TypeError(e);
}, d = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? X(t, i) : t, c = e.length - 1, m; c >= 0; c--)
    (m = e[c]) && (a = (r ? m(t, i, a) : m(a)) || a);
  return r && a && K(t, i, a), a;
}, j = (e, t, i) => t.has(e) || R("Cannot " + i), G = (e, t, i) => t.has(e) ? R("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Z = (e, t, i) => (j(e, t, "access private method"), i), _, S;
let o = class extends E(x) {
  constructor() {
    super(), G(this, _), this.mandatoryMessage = M, this.readonly = !1, this._multiple = !1, this._allowedTypes = [], this.consumeContext(L, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(
        e?.variantId,
        (t) => this._variantId = t?.toString() || "invariant"
      );
    });
  }
  set config(e) {
    if (!e) return;
    this._multiple = e.getValueByAlias("multiple") ?? !1;
    const t = e.getValueByAlias("validationLimit");
    this._min = t?.min ?? void 0, this._max = t?.max ?? void 0, this._allowedTypes = e.getValueByAlias("allowedTypes") ?? [];
  }
  firstUpdated() {
    this.addFormControlElement(this.shadowRoot.querySelector("input-oembed"));
  }
  render() {
    return p`
      <input-oembed
        .alias=${this._alias}
        .value=${this.value}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        ?multiple=${this._multiple}
        .min=${this._min}
        .max=${this._max}
        .allowedTypes=${this._allowedTypes}
        @change=${Z(this, _, S)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
_ = /* @__PURE__ */ new WeakSet();
S = function(e) {
  const t = !e.target.value?.length;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new g());
};
o.tagName = "oembed-property-editor";
d([
  h({ type: Boolean })
], o.prototype, "mandatory", 2);
d([
  h({ type: String })
], o.prototype, "mandatoryMessage", 2);
d([
  h({ type: Boolean, reflect: !0 })
], o.prototype, "readonly", 2);
d([
  y()
], o.prototype, "_alias", 2);
d([
  y()
], o.prototype, "_variantId", 2);
d([
  y()
], o.prototype, "_multiple", 2);
d([
  y()
], o.prototype, "_min", 2);
d([
  y()
], o.prototype, "_max", 2);
d([
  y()
], o.prototype, "_allowedTypes", 2);
o = d([
  $(o.tagName)
], o);
export {
  o as default,
  o as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-5DCt487o.js.map
