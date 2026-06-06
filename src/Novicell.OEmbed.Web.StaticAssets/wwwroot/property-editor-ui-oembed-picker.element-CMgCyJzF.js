import { when as z, html as m, nothing as b, css as A, property as u, customElement as g, state as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as _ } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as $ } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as B } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as w, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as R } from "@umbraco-cms/backoffice/validation";
import { UmbModalToken as T, umbConfirmModal as N, umbOpenModal as U } from "@umbraco-cms/backoffice/modal";
import "./oembed-preview.element-k5Io9aFz.js";
const D = new T(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var S = Object.defineProperty, q = Object.getOwnPropertyDescriptor, O = (e) => {
  throw TypeError(e);
}, p = (e, t, a, o) => {
  for (var r = o > 1 ? void 0 : o ? q(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (r = (o ? c(t, a, r) : c(r)) || r);
  return o && r && S(t, a, r), r;
}, L = (e, t, a) => t.has(e) || O("Cannot " + a), V = (e, t, a) => t.has(e) ? O("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), s = (e, t, a) => (L(e, t, "access private method"), a), i, y, f, M, P, C, I;
let l = class extends w($) {
  constructor() {
    super(...arguments), V(this, i);
  }
  async requestRemoveItem(e) {
    const t = e.oembed.title || e.url;
    await N(this, {
      color: "danger",
      headline: `#actions_remove ${t}?`,
      content: `#defaultdialogs_confirmremove ${t}?`,
      confirmLabel: "#actions_remove"
    });
  }
  render() {
    const e = s(this, i, y).call(this, this.value);
    return m`<div class="container">
      ${z(
      e,
      () => s(this, i, C).call(this, this.value),
      () => s(this, i, I).call(this)
    )}
    </div>`;
  }
};
i = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return !!(e?.url && e?.oembed?.type);
};
f = async function(e) {
  const t = await U(this, D, {
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
P = function() {
  return this.readonly ? b : m`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => s(this, i, M).call(this)}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
};
C = function(e) {
  return m`
      <uui-card-media
        .name=${e.oembed.title}
        .selectonly="true"
        .selectable="false"
        @open="${() => s(this, i, f).call(this, e.url)}"
        ?readonly=${this.readonly}
      >
        <oembed-preview .value="${e.oembed}"></oembed-preview>
        ${s(this, i, P).call(this)}
      </uui-card-media>
    `;
};
I = function() {
  return this.readonly || s(this, i, y).call(this, this.value) ? b : m`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${s(this, i, f)}
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
  A`
      :host {
        position: relative;
      }

      .container {
        display: grid;
        gap: var(--uui-size-space-5);
        grid-template-columns: repeat(
          auto-fill,
          minmax(var(--umb-card-medium-min-width), 1fr)
        );
        grid-auto-rows: var(--umb-card-medium-min-width);
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
  g(l.tagName)
], l);
var W = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, k = (e) => {
  throw TypeError(e);
}, h = (e, t, a, o) => {
  for (var r = o > 1 ? void 0 : o ? Y(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (r = (o ? c(t, a, r) : c(r)) || r);
  return o && r && W(t, a, r), r;
}, H = (e, t, a) => t.has(e) || k("Cannot " + a), F = (e, t, a) => t.has(e) ? k("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), K = (e, t, a) => (H(e, t, "access private method"), a), v, x;
let n = class extends w($) {
  constructor() {
    super(), F(this, v), this.mandatoryMessage = R, this.readonly = !1, this.consumeContext(B, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(
        e?.variantId,
        (t) => this._variantId = t?.toString() || "invariant"
      );
    });
  }
  render() {
    return m`
      <input-oembed
        .alias=${this._alias}
        .value=${this.value}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        @change=${K(this, v, x)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
v = /* @__PURE__ */ new WeakSet();
x = function(e) {
  const t = e.target.value === void 0;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new _());
};
n.tagName = "oembed-property-editor";
h([
  u({ type: Boolean })
], n.prototype, "mandatory", 2);
h([
  u({ type: String })
], n.prototype, "mandatoryMessage", 2);
h([
  u({ type: Boolean, reflect: !0 })
], n.prototype, "readonly", 2);
h([
  E()
], n.prototype, "_alias", 2);
h([
  E()
], n.prototype, "_variantId", 2);
n = h([
  g(n.tagName)
], n);
export {
  n as default,
  n as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-CMgCyJzF.js.map
