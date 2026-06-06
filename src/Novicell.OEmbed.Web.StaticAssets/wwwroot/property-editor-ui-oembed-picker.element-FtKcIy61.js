import { html as _, property as m, state as h, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as c } from "@umbraco-cms/backoffice/event";
import { UmbLitElement as u } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as E } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as f, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as g } from "@umbraco-cms/backoffice/validation";
var I = Object.defineProperty, O = Object.getOwnPropertyDescriptor, l = (t) => {
  throw TypeError(t);
}, i = (t, e, a, s) => {
  for (var o = s > 1 ? void 0 : s ? O(e, a) : e, n = t.length - 1, p; n >= 0; n--)
    (p = t[n]) && (o = (s ? p(e, a, o) : p(o)) || o);
  return s && o && I(e, a, o), o;
}, P = (t, e, a) => e.has(t) || l("Cannot " + a), C = (t, e, a) => e.has(t) ? l("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), b = (t, e, a) => (P(t, e, "access private method"), a), d, v;
let r = class extends f(u) {
  constructor() {
    super(), C(this, d), this.mandatoryMessage = g, this.readonly = !1, this.consumeContext(E, (t) => {
      this.observe(t?.alias, (e) => this._alias = e), this.observe(t?.variantId, (e) => this._variantId = e?.toString() || "invariant");
    });
  }
  render() {
    return _`

            hello from OEmbed Picker UI, alias: ${this._alias}, variantId: ${this._variantId}

			<input-oembed
				.alias=${this._alias}
				.value=${this.value}
                .variantId=${this._variantId}
                .required=${this.mandatory}
				.requiredMessage=${this.mandatoryMessage}
				@change=${b(this, d, v)}
				?readonly=${this.readonly}>
			</input-oembed>
		`;
  }
};
d = /* @__PURE__ */ new WeakSet();
v = function(t) {
  const e = t.target.value === void 0;
  this.value = e ? void 0 : t.target.value, this.dispatchEvent(new c());
};
r.tagName = "oembed-property-editor";
i([
  m({ type: Boolean })
], r.prototype, "mandatory", 2);
i([
  m({ type: String })
], r.prototype, "mandatoryMessage", 2);
i([
  m({ type: Boolean, reflect: !0 })
], r.prototype, "readonly", 2);
i([
  h()
], r.prototype, "_alias", 2);
i([
  h()
], r.prototype, "_variantId", 2);
r = i([
  y(r.tagName)
], r);
export {
  r as default
};
//# sourceMappingURL=property-editor-ui-oembed-picker.element-FtKcIy61.js.map
