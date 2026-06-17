import { U as z, a as O } from "./oembed-preview.element-B40iok3S.js";
import { html as l, when as f, css as B, state as L, customElement as M, nothing as h } from "@umbraco-cms/backoffice/external/lit";
import { umbFocus as S } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as T } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as q } from "@umbraco-cms/backoffice/style";
import { UmbValidationContext as N, umbBindToValidation as W } from "@umbraco-cms/backoffice/validation";
var A = Object.defineProperty, D = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, y = (t, e, i, c) => {
  for (var s = c > 1 ? void 0 : c ? D(e, i) : e, d = t.length - 1, p; d >= 0; d--)
    (p = t[d]) && (s = (c ? p(e, i, s) : p(s)) || s);
  return c && s && A(e, i, s), s;
}, w = (t, e, i) => e.has(t) || $("Cannot " + i), n = (t, e, i) => (w(t, e, "read from private field"), i ? i.call(t) : e.get(t)), m = (t, e, i) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), o = (t, e, i) => (w(t, e, "access private method"), i), _, a, r, g, U, v, C, b, P, k, E, x;
let u = class extends T {
  // Provide context to child components
  constructor() {
    super(), m(this, r), m(this, _, new N(this)), m(this, a, new z(this)), this._currentUrl = "", this._currentLoading = "idle", this._currentError = void 0, this._currentPreview = void 0, this.provideContext(O, n(this, a));
  }
  connectedCallback() {
    super.connectedCallback(), this.observe(n(this, a).url$, (t) => {
      this._currentUrl = t, this.requestUpdate();
    }), this.observe(n(this, a).loading$, (t) => {
      this._currentLoading = t, this.requestUpdate();
    }), this.observe(n(this, a).error$, (t) => {
      this._currentError = t, this.requestUpdate();
    }), this.observe(n(this, a).preview$, (t) => {
      this._currentPreview = t, this.requestUpdate();
    }), this.data?.url && (n(this, a).updateUrl(this.data.url), o(this, r, v).call(this));
  }
  renderInput() {
    return l`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._currentUrl}
        @input=${o(this, r, C)}
        required="true"
        ${S()}
        ${W(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${o(this, r, v)}
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
          ${f(
      this._currentLoading === "loading",
      () => l`<uui-loader-circle></uui-loader-circle>`
    )}
          ${f(
      this._currentLoading === "success" && this._currentPreview,
      () => o(this, r, x).call(this, this._currentPreview)
    )}
        </uui-box>
        <uui-button
          slot="actions"
          id="cancel"
          look="secondary"
          label=${this.localize.term("buttons_confirmActionCancel")}
          @click=${o(this, r, g)}
        ></uui-button>
        <uui-button
          slot="actions"
          id="submit"
          color="positive"
          look="primary"
          .state=${this._submitButtonState}
          label=${this.localize.term("buttons_confirmActionConfirm")}
          @click=${o(this, r, U)}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
_ = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
g = function() {
  this.modalContext?.reject();
};
U = async function() {
  this._submitButtonState = "waiting";
  try {
    await n(this, _).validate(), this._submitButtonState = "success";
    const t = n(this, a).getUrl();
    this.value = {
      ...this.value,
      oembed: this._currentPreview,
      url: t
    }, this.modalContext?.submit();
  } catch {
    this._submitButtonState = "failed";
  }
};
v = async function() {
  await n(this, a).fetchPreview();
};
C = function(t) {
  n(this, a).updateUrl(t.target.value);
};
b = function(t, e) {
  return !t || !e ? h : l`<a href="${t}" target="_blank" rel="noopener noreferrer"
      >${e}</a
    >`;
};
P = function(t, e) {
  return !t || !e ? h : l`<span
      >${this.localize.term("general_by").toLocaleLowerCase()}
      ${o(this, r, b).call(this, e, t)}</span
    >`;
};
k = function(t, e) {
  return !t || !e ? h : l`<span
      >${this.localize.term("general_on").toLocaleLowerCase()}
      ${o(this, r, b).call(this, e, t)}</span
    >`;
};
E = function(t, e, i, c) {
  return t ? l`<umb-property-layout
      label=${this.localize.term("general_thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <div>
          <img src="${t}" width="${e}" height="${i}" alt="${c}" />
        </div>
      </div>
    </umb-property-layout>` : h;
};
x = function(t) {
  return l`
      <umb-property-layout
        label=${this.localize.term("general_preview")}
        orientation="vertical"
      >
        <div slot="editor">
          <oembed-preview .value="${t}"></oembed-preview>
          <div>${t.title}</div>
          <small slot="detail">
            ${o(this, r, P).call(this, t.authorName, t.authorUrl)}
            ${o(this, r, k).call(this, t.providerName, t.providerUrl)}
          </small>
        </div>
      </umb-property-layout>
      ${o(this, r, E).call(this, t.thumbnailUrl, t.thumbnailWidth, t.thumbnailHeight, t.title)}
    `;
};
u.tagName = "oembed-modal";
u.styles = [
  q,
  B`
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
y([
  L()
], u.prototype, "_submitButtonState", 2);
u = y([
  M(u.tagName)
], u);
const R = u;
export {
  u as OembedPickerModalElement,
  R as default
};
//# sourceMappingURL=oembed-picker-modal.element-pXLJCD_u.js.map
