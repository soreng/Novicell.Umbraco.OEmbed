import { when as R, html as h, nothing as g, css as U, property as u, customElement as b, state as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as _ } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as w } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as A } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as E, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as T } from "@umbraco-cms/backoffice/validation";
import { UmbModalToken as D, umbConfirmModal as L, umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import "./oembed-preview.element-B03RQRf5.js";
const V = new D(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var q = Object.defineProperty, W = Object.getOwnPropertyDescriptor, O = (e) => {
  throw TypeError(e);
}, p = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? W(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && q(t, a, i), i;
}, H = (e, t, a) => t.has(e) || O("Cannot " + a), Y = (e, t, a) => t.has(e) ? O("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), n = (e, t, a) => (H(e, t, "access private method"), a), r, f, y, M, C, P, I, k, x, z;
let l = class extends E(w) {
  constructor() {
    super(...arguments), Y(this, r);
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
    const e = n(this, r, f).call(this, this.value);
    return h`<div class="container">
      ${R(
      e,
      () => n(this, r, x).call(this, this.value),
      () => n(this, r, z).call(this)
    )}
    </div>`;
  }
};
r = /* @__PURE__ */ new WeakSet();
f = function(e) {
  return !!(e?.url && e?.oembed?.type);
};
y = async function(e) {
  const t = await S(this, V, {
    data: {
      url: e
      //types: ['video', 'rich', 'photo', 'link'],
    }
  }).catch(() => {
  });
  t && (this.value = {
    ...t
  }, this.dispatchEvent(new _()));
};
M = async function() {
  try {
    await this.requestRemoveItem(this.value), this.value = void 0, this.dispatchEvent(new _());
  } catch {
  }
};
C = function() {
  return this.readonly ? g : h`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => n(this, r, M).call(this)}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
};
P = function(e) {
  return [e.providerName, e.authorName].filter(Boolean).join(" · ");
};
I = function(e) {
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
k = function(e) {
  return e.oembed.thumbnailUrl ? h`<img
        src=${e.oembed.thumbnailUrl}
        alt=${e.oembed.title ?? e.url}
      />` : h`<oembed-preview .value="${e.oembed}"></oembed-preview>`;
};
x = function(e) {
  return h`
      <uui-card-media
        style=${`aspect-ratio: ${n(this, r, I).call(this, e.oembed)}`}
        .name=${e.oembed.title ?? e.url}
        .detail=${n(this, r, P).call(this, e.oembed)}
        .selectonly="true"
        .selectable="false"
        @open="${() => n(this, r, y).call(this, e.url)}"
        ?readonly=${this.readonly}
      >
        ${n(this, r, k).call(this, e)} ${n(this, r, C).call(this)}
      </uui-card-media>
    `;
};
z = function() {
  return this.readonly || n(this, r, f).call(this, this.value) ? g : h`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${() => n(this, r, y).call(this)}
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
  U`
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
p([
  u({ type: Boolean })
], l.prototype, "required", 2);
p([
  u({ type: String })
], l.prototype, "requiredMessage", 2);
p([
  u({ type: Boolean, reflect: !0 })
], l.prototype, "readonly", 2);
l = p([
  b(l.tagName)
], l);
var j = Object.defineProperty, F = Object.getOwnPropertyDescriptor, B = (e) => {
  throw TypeError(e);
}, m = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? F(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && j(t, a, i), i;
}, K = (e, t, a) => t.has(e) || B("Cannot " + a), X = (e, t, a) => t.has(e) ? B("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), Z = (e, t, a) => (K(e, t, "access private method"), a), v, N;
let s = class extends E(w) {
  constructor() {
    super(), X(this, v), this.mandatoryMessage = T, this.readonly = !1, this.consumeContext(A, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(
        e?.variantId,
        (t) => this._variantId = t?.toString() || "invariant"
      );
    });
  }
  render() {
    return h`
      <input-oembed
        .alias=${this._alias}
        .value=${this.value}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        @change=${Z(this, v, N)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
v = /* @__PURE__ */ new WeakSet();
N = function(e) {
  const t = e.target.value === void 0;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new _());
};
s.tagName = "oembed-property-editor";
m([
  u({ type: Boolean })
], s.prototype, "mandatory", 2);
m([
  u({ type: String })
], s.prototype, "mandatoryMessage", 2);
m([
  u({ type: Boolean, reflect: !0 })
], s.prototype, "readonly", 2);
m([
  $()
], s.prototype, "_alias", 2);
m([
  $()
], s.prototype, "_variantId", 2);
s = m([
  b(s.tagName)
], s);
export {
  s as default,
  s as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-KFn5TPMm.js.map
