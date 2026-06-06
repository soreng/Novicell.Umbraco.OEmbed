import { when as x, html as m, nothing as g, css as z, property as u, customElement as f, state as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as y } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as O } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as A } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as $, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as B } from "@umbraco-cms/backoffice/validation";
import { UmbModalToken as R, umbConfirmModal as T, umbOpenModal as N } from "@umbraco-cms/backoffice/modal";
import "./oembed-preview.element-CSGYbOax.js";
const U = new R(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var D = Object.defineProperty, S = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, p = (e, t, a, o) => {
  for (var r = o > 1 ? void 0 : o ? S(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (r = (o ? c(t, a, r) : c(r)) || r);
  return o && r && D(t, a, r), r;
}, L = (e, t, a) => t.has(e) || w("Cannot " + a), V = (e, t, a) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), s = (e, t, a) => (L(e, t, "access private method"), a), i, _, b, I, M, P, C;
let l = class extends $(O) {
  constructor() {
    super(...arguments), V(this, i);
  }
  connectedCallback() {
    super.connectedCallback(), console.log("[InputOEmbed] connected", {
      value: this.value,
      readonly: this.readonly,
      required: this.required,
      requiredMessage: this.requiredMessage
    });
  }
  async requestRemoveItem(e) {
    const t = e.oembed.title || e.url;
    await T(this, {
      color: "danger",
      headline: `#actions_remove ${t}?`,
      content: `#defaultdialogs_confirmremove ${t}?`,
      confirmLabel: "#actions_remove"
    });
  }
  render() {
    const e = s(this, i, _).call(this, this.value);
    return console.log("[InputOEmbed] render", {
      hasRenderableValue: e,
      value: this.value,
      readonly: this.readonly
    }), m`<div class="container">
      ${x(
      e,
      () => s(this, i, P).call(this, this.value),
      () => s(this, i, C).call(this)
    )}
    </div>`;
  }
};
i = /* @__PURE__ */ new WeakSet();
_ = function(e) {
  const t = !!(e?.url && e?.oembed?.type);
  return console.log("[InputOEmbed] hasRenderableValue", {
    hasRenderableValue: t,
    value: e
  }), t;
};
b = async function(e) {
  const t = await N(this, U, {
    data: {
      url: e
      //types: ['video', 'rich', 'photo', 'link'],
    }
  }).catch(() => {
  });
  t && (console.log("picked oembed", t), this.value = {
    ...t
  }, this.dispatchEvent(new y()));
};
I = async function() {
  try {
    await this.requestRemoveItem(this.value), this.value = void 0, this.dispatchEvent(new y());
  } catch {
  }
};
M = function() {
  return this.readonly ? g : m`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => s(this, i, I).call(this)}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
};
P = function(e) {
  return console.log("[InputOEmbed] render preview", { value: e }), m`
      <uui-card-media
        .name=${e.oembed.title}
        .selectonly="true"
        .selectable="false"
        @open="${() => s(this, i, b).call(this, e.url)}"
        ?readonly=${this.readonly}
      >
        <oembed-preview .value="${e.oembed}"></oembed-preview>
        ${s(this, i, M).call(this)}
      </uui-card-media>
    `;
};
C = function() {
  return this.readonly || s(this, i, _).call(this, this.value) ? g : (console.log("[InputOEmbed] render add button", {
    value: this.value,
    readonly: this.readonly
  }), m`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
        @click=${s(this, i, b)}
        label=${this.localize.term("general_choose")}
        ?disabled=${this.readonly}
      >
        <uui-icon name="icon-add"></uui-icon>
        ${this.localize.term("general_choose")}
      </uui-button>
    `);
};
l.tagName = "input-oembed";
l.styles = [
  z`
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
  f(l.tagName)
], l);
var W = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, k = (e) => {
  throw TypeError(e);
}, h = (e, t, a, o) => {
  for (var r = o > 1 ? void 0 : o ? Y(t, a) : t, d = e.length - 1, c; d >= 0; d--)
    (c = e[d]) && (r = (o ? c(t, a, r) : c(r)) || r);
  return o && r && W(t, a, r), r;
}, H = (e, t, a) => t.has(e) || k("Cannot " + a), F = (e, t, a) => t.has(e) ? k("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), K = (e, t, a) => (H(e, t, "access private method"), a), v, q;
let n = class extends $(O) {
  constructor() {
    super(), F(this, v), this.mandatoryMessage = B, this.readonly = !1, this.consumeContext(A, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(
        e?.variantId,
        (t) => this._variantId = t?.toString() || "invariant"
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), console.log("[OEmbedPropertyEditor] connected", {
      alias: this._alias,
      variantId: this._variantId,
      value: this.value,
      readonly: this.readonly,
      mandatory: this.mandatory
    });
  }
  render() {
    return console.log("[OEmbedPropertyEditor] render", {
      alias: this._alias,
      variantId: this._variantId,
      value: this.value,
      readonly: this.readonly,
      mandatory: this.mandatory
    }), m`
      <input-oembed
        .alias=${this._alias}
        .value=${this.value}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        @change=${K(this, v, q)}
        ?readonly=${this.readonly}
      >
      </input-oembed>
    `;
  }
};
v = /* @__PURE__ */ new WeakSet();
q = function(e) {
  const t = e.target.value === void 0;
  this.value = t ? void 0 : e.target.value, console.log("[OEmbedPropertyEditor] change", {
    isEmpty: t,
    value: this.value
  }), this.dispatchEvent(new y());
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
  f(n.tagName)
], n);
export {
  n as default,
  n as element
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-4j4pziRE.js.map
