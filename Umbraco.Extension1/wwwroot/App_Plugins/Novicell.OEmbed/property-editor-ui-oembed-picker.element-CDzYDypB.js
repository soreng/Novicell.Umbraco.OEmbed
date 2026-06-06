import { when as U, html as m, nothing as $, css as B, property as u, customElement as E, state as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as f } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as M } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalToken as q, umbConfirmModal as D, umbOpenModal as W } from "@umbraco-cms/backoffice/modal";
import { UmbFormControlMixin as k, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as L } from "@umbraco-cms/backoffice/validation";
import "./oembed-preview.element-CvEgDiRG.js";
import { UMB_PROPERTY_CONTEXT as N } from "@umbraco-cms/backoffice/property";
const R = new q(
  "Novicell.Modal.OEmbedPicker",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var Y = Object.defineProperty, G = Object.getOwnPropertyDescriptor, P = (e) => {
  throw TypeError(e);
}, v = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? G(t, a) : t, l = e.length - 1, c; l >= 0; l--)
    (c = e[l]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && Y(t, a, i), i;
}, C = (e, t, a) => t.has(e) || P("Cannot " + a), w = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), _ = (e, t, a) => t.has(e) ? P("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), s = (e, t, a) => (C(e, t, "access private method"), a), b, g, r, p, I, x, z, A;
let d = class extends k(M) {
  constructor() {
    super(...arguments), _(this, r), _(this, b, async () => {
      await s(this, r, p).call(this, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }), _(this, g, async () => {
      await s(this, r, p).call(this, "https://www.youtube.com/watch?v=9bZkp7q19f0");
    });
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
    return m`<div class="container">
          ${U(
      this.value !== void 0,
      () => s(this, r, z).call(this, this.value),
      () => s(this, r, A).call(this)
    )}
        </div>`;
  }
};
b = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
p = async function(e) {
  const t = await W(this, R, {
    data: {
      url: e
      //types: ['video', 'rich', 'photo', 'link'],
    }
  }).catch(() => {
  });
  t && (console.log("picked oembed", t), this.value = {
    ...t
  }, this.dispatchEvent(new f()));
};
I = async function() {
  try {
    await this.requestRemoveItem(this.value), this.value = void 0, this.dispatchEvent(new f());
  } catch {
  }
};
x = function() {
  return this.readonly ? $ : m`
			<uui-action-bar slot="actions">
				<uui-button label=${this.localize.term("general_remove")} look="secondary" @click=${() => s(this, r, I).call(this)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</uui-action-bar>
		`;
};
z = function(e) {
  return m`
            <uui-card-media
                    .name=${e.oembed.title}
                    .selectonly="true"
                    .selectable="false"
                    @open="${() => s(this, r, p).call(this, e.url)}"
                     ?readonly=${this.readonly}>
                <oembed-preview .value="${e.oembed}"></oembed-preview>
                ${s(this, r, x).call(this)}
            </uui-card-media>
        `;
};
A = function() {
  return this.readonly || this.value ? $ : m`
            <uui-button
                    id="btn-add"
                    look="placeholder"
                    @blur=${() => {
    this.pristine = !1, this.checkValidity();
  }}
                    @click=${s(this, r, p)}
                    label=${this.localize.term("general_choose")}
                    ?disabled=${this.readonly}>
                <uui-icon name="icon-add"></uui-icon>
                ${this.localize.term("general_choose")}
            </uui-button>
            <uui-button
                    label="Rick A."
                    look="primary"
                    @click="${w(this, b)}"
            ></uui-button>
            <uui-button
                    label="PSY!"
                    look="primary"
                    @click="${w(this, g)}"
            ></uui-button>
        `;
};
d.styles = [
  B`
            :host {
                position: relative;
            }

            .container {
                display: grid;
                gap: var(--uui-size-space-5);
                grid-template-columns: repeat(auto-fill, minmax(var(--umb-card-medium-min-width), 1fr));
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
v([
  u({ type: Boolean })
], d.prototype, "required", 2);
v([
  u({ type: String })
], d.prototype, "requiredMessage", 2);
v([
  u({ type: Boolean, reflect: !0 })
], d.prototype, "readonly", 2);
d = v([
  E("input-oembed")
], d);
var H = Object.defineProperty, Q = Object.getOwnPropertyDescriptor, S = (e) => {
  throw TypeError(e);
}, h = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? Q(t, a) : t, l = e.length - 1, c; l >= 0; l--)
    (c = e[l]) && (i = (o ? c(t, a, i) : c(i)) || i);
  return o && i && H(t, a, i), i;
}, V = (e, t, a) => t.has(e) || S("Cannot " + a), X = (e, t, a) => t.has(e) ? S("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), Z = (e, t, a) => (V(e, t, "access private method"), a), y, T;
let n = class extends k(M) {
  constructor() {
    super(), X(this, y), this.mandatoryMessage = L, this.readonly = !1, this.consumeContext(N, (e) => {
      this.observe(e?.alias, (t) => this._alias = t), this.observe(e?.variantId, (t) => this._variantId = t?.toString() || "invariant");
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
				@change=${Z(this, y, T)}
				?readonly=${this.readonly}>
			</input-oembed>
		`;
  }
};
y = /* @__PURE__ */ new WeakSet();
T = function(e) {
  const t = e.target.value === void 0;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new f());
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
  O()
], n.prototype, "_alias", 2);
h([
  O()
], n.prototype, "_variantId", 2);
n = h([
  E(n.tagName)
], n);
export {
  n as default
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-CDzYDypB.js.map
