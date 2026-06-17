import "./client.gen-DVwspqDp.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as M } from "./oembed.repository-Y4nXUpA8.js";
import { html as l, when as w, css as x, state as d, customElement as B, nothing as p } from "@umbraco-cms/backoffice/external/lit";
import { umbFocus as W } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as L } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as A } from "@umbraco-cms/backoffice/style";
import "./oembed-preview.element-B03RQRf5.js";
import { UmbValidationContext as N, umbBindToValidation as T } from "@umbraco-cms/backoffice/validation";
var q = Object.defineProperty, D = Object.getOwnPropertyDescriptor, k = (t) => {
  throw TypeError(t);
}, u = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? D(e, i) : e, m = t.length - 1, _; m >= 0; m--)
    (_ = t[m]) && (s = (n ? _(e, i, s) : _(s)) || s);
  return n && s && q(e, i, s), s;
}, f = (t, e, i) => e.has(t) || k("Cannot " + i), v = (t, e, i) => (f(t, e, "read from private field"), i ? i.call(t) : e.get(t)), h = (t, e, i) => e.has(t) ? k("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), I = (t, e, i, n) => (f(t, e, "write to private field"), e.set(t, i), i), a = (t, e, i) => (f(t, e, "access private method"), i), y, $, c, r, C, z, b, E, g, P, U, O, S;
let o = class extends L {
  constructor() {
    super(...arguments), h(this, r), h(this, y, new N(this)), h(this, $, new M(this)), h(this, c), this._error = void 0, this._url = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.data?.url && (this._url = this.data.url, a(this, r, b).call(this));
  }
  renderInput() {
    return l`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._url}
        @input=${a(this, r, E)}
        required="true"
        ${W()}
        ${T(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${a(this, r, b)}
          label=${this.localize.term("general_retrieve")}
        ></uui-button>
      </uui-input>
    `;
  }
  render() {
    return l`
      <umb-body-layout headline="Embed">
        <uui-box>
          <umb-property-layout
            label=${this.localize.term("general_url")}
            orientation="vertical"
          >
            <div slot="editor">${this.renderInput()}</div>
          </umb-property-layout>
          ${w(
      this._loading === "waiting",
      () => l`<uui-loader-circle></uui-loader-circle>`
    )}
          ${w(
      this._loading === "success",
      () => a(this, r, S).call(this, this.value.oembed)
    )}
        </uui-box>
        <uui-button
          slot="actions"
          id="cancel"
          look="secondary"
          label=${this.localize.term("buttons_confirmActionCancel")}
          @click=${a(this, r, C)}
        ></uui-button>
        <uui-button
          slot="actions"
          id="submit"
          color="positive"
          look="primary"
          .state=${this._submitButtonState}
          label=${this.localize.term("buttons_confirmActionConfirm")}
          @click=${a(this, r, z)}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
y = /* @__PURE__ */ new WeakMap();
$ = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
C = function() {
  this.modalContext?.reject();
};
z = async function() {
  this._submitButtonState = "waiting";
  try {
    await v(this, y).validate(), this._submitButtonState = "success", this.modalContext?.submit();
  } catch {
    this._submitButtonState = "failed";
  }
};
b = async function() {
  this._loading = "waiting";
  const { data: t, error: e } = await v(this, $).requestOEmbed({
    url: this._url
    //maxWidth: this._width > 0 ? this._width : undefined,
    //maxHeight: this._height > 0 ? this._height : undefined,
  });
  t ? (I(this, c, this._url), this.value = {
    ...this.value,
    oembed: {
      ...t
    },
    url: v(this, c)
  }, this._error = void 0) : this._error = e || void 0, this._loading = this._error === void 0 ? "success" : "failed";
};
E = function(t) {
  this._url = t.target.value;
};
g = function(t, e) {
  return !t || !e ? p : l`<a href="${t}" target="_blank" rel="noopener noreferrer"
      >${e}</a
    >`;
};
P = function(t, e) {
  return !t || !e ? p : l`<span
      >${this.localize.term("general_by").toLocaleLowerCase()}
      ${a(this, r, g).call(this, e, t)}</span
    >`;
};
U = function(t, e) {
  return !t || !e ? p : l`<span
      >${this.localize.term("general_on").toLocaleLowerCase()}
      ${a(this, r, g).call(this, e, t)}</span
    >`;
};
O = function(t, e, i, n) {
  return t ? l`<umb-property-layout
      label=${this.localize.term("general_thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <div>
          <img src="${t}" width="${e}" height="${i}" alt="${n}" />
        </div>
      </div>
    </umb-property-layout>` : p;
};
S = function(t) {
  return l`
      <umb-property-layout
        label=${this.localize.term("general_preview")}
        orientation="vertical"
      >
        <div slot="editor">
          <oembed-preview .value="${t}"></oembed-preview>
          <div>${t.title}</div>
          <small slot="detail">
            ${a(this, r, P).call(this, t.authorName, t.authorUrl)}
            ${a(this, r, U).call(this, t.providerName, t.providerUrl)}
          </small>
        </div>
      </umb-property-layout>
      ${a(this, r, O).call(this, t.thumbnailUrl, t.thumbnailWidth, t.thumbnailHeight, t.title)}
    `;
};
o.tagName = "oembed-modal";
o.styles = [
  A,
  x`
      uui-input {
        width: 100%;
        --uui-button-border-radius: 0;
      }

      umb-property-layout:first-child {
        padding-top: 0;
      }

      umb-property-layout:last-child {
        padding-bottom: 0;
      }
    `
];
u([
  d()
], o.prototype, "_loading", 2);
u([
  d()
], o.prototype, "_error", 2);
u([
  d()
], o.prototype, "_url", 2);
u([
  d()
], o.prototype, "_submitButtonState", 2);
o = u([
  B(o.tagName)
], o);
const Y = o;
export {
  o as OembedPickerModalElement,
  Y as default
};
//# sourceMappingURL=oembed-picker-modal.element-BahOIM21.js.map
