import { U as O, a as B } from "./oembed-preview.element-C-UoyBML.js";
import { html as u, when as g, css as M, state as S, customElement as T, nothing as p } from "@umbraco-cms/backoffice/external/lit";
import { umbFocus as D } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as L } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as q } from "@umbraco-cms/backoffice/style";
import { UmbValidationContext as N, umbBindToValidation as W } from "@umbraco-cms/backoffice/validation";
var A = Object.defineProperty, I = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, $ = (t, e, r, s) => {
  for (var h = s > 1 ? void 0 : s ? I(e, r) : e, m = t.length - 1, _; m >= 0; m--)
    (_ = t[m]) && (h = (s ? _(e, r, h) : _(h)) || h);
  return s && h && A(e, r, h), h;
}, w = (t, e, r) => e.has(t) || y("Cannot " + r), n = (t, e, r) => (w(t, e, "read from private field"), r ? r.call(t) : e.get(t)), v = (t, e, r) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), a = (t, e, r) => (w(t, e, "access private method"), r), f, l, i, U, P, b, k, o, x, c, C, E, z;
let d = class extends L {
  // Provide context to child components
  constructor() {
    super(), v(this, i), v(this, f, new N(this)), v(this, l, new O(this)), this._currentUrl = "", this._currentLoading = "idle", this._currentError = void 0, this._currentPreview = void 0, this.provideContext(B, n(this, l));
  }
  connectedCallback() {
    super.connectedCallback(), this.observe(n(this, l).url$, (t) => {
      this._currentUrl = t, this.requestUpdate();
    }), this.observe(n(this, l).loading$, (t) => {
      this._currentLoading = t, this.requestUpdate();
    }), this.observe(n(this, l).error$, (t) => {
      this._currentError = t, this.requestUpdate();
    }), this.observe(n(this, l).preview$, (t) => {
      this._currentPreview = t, this.requestUpdate();
    }), this.data?.url && (n(this, l).updateUrl(this.data.url), a(this, i, b).call(this));
  }
  renderInput() {
    return u`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._currentUrl}
        @input=${a(this, i, k)}
        required="true"
        ${D()}
        ${W(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${a(this, i, b)}
          label=${this.localize.term("general_retrieve")}
        ></uui-button>
      </uui-input>
    `;
  }
  render() {
    return u`
      <umb-body-layout headline="Embed">
        <uui-box>
          <umb-property-layout
            label=${this.localize.term("general_url")}
            orientation="vertical"
          >
            <div slot="editor">${this.renderInput()}</div>
          </umb-property-layout>
          ${g(
      this._currentLoading === "loading",
      () => u`<uui-loader-circle></uui-loader-circle>`
    )}
          ${g(
      this._currentLoading === "success" && this._currentPreview,
      () => a(this, i, z).call(this, this._currentPreview)
    )}
        </uui-box>
        <uui-button
          slot="actions"
          id="cancel"
          look="secondary"
          label=${this.localize.term("buttons_confirmActionCancel")}
          @click=${a(this, i, U)}
        ></uui-button>
        <uui-button
          slot="actions"
          id="submit"
          color="positive"
          look="primary"
          .state=${this._submitButtonState}
          label=${this.localize.term("buttons_confirmActionConfirm")}
          @click=${a(this, i, P)}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
U = function() {
  this.modalContext?.reject();
};
P = async function() {
  this._submitButtonState = "waiting";
  try {
    await n(this, f).validate(), this._submitButtonState = "success";
    const t = n(this, l).getUrl();
    this.value = {
      ...this.value,
      oembed: this._currentPreview,
      url: t
    }, this.modalContext?.submit();
  } catch {
    this._submitButtonState = "failed";
  }
};
b = async function() {
  await n(this, l).fetchPreview();
};
k = function(t) {
  n(this, l).updateUrl(t.target.value);
};
o = function(t, e) {
  const r = this.localize.term(t);
  return !r || r === t ? e : r;
};
x = function(t, e) {
  return !t || !e ? p : u`<a href="${t}" target="_blank" rel="noopener noreferrer"
      >${e}</a
    >`;
};
c = function(t, e, r) {
  if (e == null || e === "") return p;
  const s = r ? a(this, i, x).call(this, r, String(e)) : u`<span>${e}</span>`;
  return u`<div class="oembed-details__row">
      <span class="oembed-details__label">${t}</span>
      <span class="oembed-details__value">${s}</span>
    </div>`;
};
C = function(t) {
  const e = t.width && t.height ? `${t.width} × ${t.height}` : null, r = [
    a(this, i, c).call(this, a(this, i, o).call(this, "general_title", "Title"), t.title),
    a(this, i, c).call(this, a(this, i, o).call(this, "general_type", "Type"), t.type),
    a(this, i, c).call(this, a(this, i, o).call(this, "general_author", "Author"), t.authorName, t.authorUrl),
    a(this, i, c).call(this, a(this, i, o).call(this, "general_provider", "Provider"), t.providerName, t.providerUrl),
    a(this, i, c).call(this, a(this, i, o).call(this, "general_dimensions", "Dimensions"), e),
    a(this, i, c).call(this, a(this, i, o).call(this, "general_url", "URL"), t.url, t.url)
  ];
  return r.every((s) => s === p) ? p : u`<umb-property-layout
      label=${a(this, i, o).call(this, "general_details", "Details")}
      orientation="vertical"
    >
      <div slot="editor" class="oembed-details">${r}</div>
    </umb-property-layout>`;
};
E = function(t, e, r, s) {
  return t ? u`<umb-property-layout
      label=${a(this, i, o).call(this, "general_thumbnail", "Thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <div>
          <img src="${t}" width="${e}" height="${r}" alt="${s}" />
        </div>
      </div>
    </umb-property-layout>` : p;
};
z = function(t) {
  return u`
      <umb-property-layout
        label=${this.localize.term("general_preview")}
        orientation="vertical"
      >
        <div slot="editor">
          <oembed-preview .value="${t}"></oembed-preview>
        </div>
      </umb-property-layout>
      ${a(this, i, C).call(this, t)}
      ${a(this, i, E).call(this, t.thumbnailUrl, t.thumbnailWidth, t.thumbnailHeight, t.title)}
    `;
};
d.tagName = "oembed-modal";
d.styles = [
  q,
  M`
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

      .oembed-details {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-2, 6px);
      }

      .oembed-details__row {
        display: grid;
        grid-template-columns: minmax(80px, 25%) 1fr;
        gap: var(--uui-size-space-3, 9px);
        align-items: baseline;
      }

      .oembed-details__label {
        color: var(--uui-color-text-alt, #515763);
        font-weight: var(--uui-font-weight-bold, 700);
      }

      .oembed-details__value {
        word-break: break-word;
      }
    `
];
$([
  S()
], d.prototype, "_submitButtonState", 2);
d = $([
  T(d.tagName)
], d);
const X = d;
export {
  d as OembedPickerModalElement,
  X as default
};
//# sourceMappingURL=oembed-picker-modal.element-Bjzo9TR_.js.map
