import { U as B, a as O } from "./oembed-preview.element-CmCRRho4.js";
import { html as u, when as g, css as S, state as M, customElement as T, nothing as d } from "@umbraco-cms/backoffice/external/lit";
import { umbFocus as D } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as L } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as N } from "@umbraco-cms/backoffice/style";
import { UmbValidationContext as W, umbBindToValidation as q } from "@umbraco-cms/backoffice/validation";
var A = Object.defineProperty, I = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, w = (t, e, r, l) => {
  for (var h = l > 1 ? void 0 : l ? I(e, r) : e, m = t.length - 1, _; m >= 0; m--)
    (_ = t[m]) && (h = (l ? _(e, r, h) : _(h)) || h);
  return l && h && A(e, r, h), h;
}, $ = (t, e, r) => e.has(t) || y("Cannot " + r), o = (t, e, r) => ($(t, e, "read from private field"), r ? r.call(t) : e.get(t)), b = (t, e, r) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), a = (t, e, r) => ($(t, e, "access private method"), r), f, s, i, U, x, v, P, n, k, c, C, E, z;
let p = class extends L {
  // Provide context to child components
  constructor() {
    super(), b(this, i), b(this, f, new W(this)), b(this, s, new B(this)), this._currentUrl = "", this._currentLoading = "idle", this._currentPreview = void 0, this.provideContext(O, o(this, s));
  }
  connectedCallback() {
    super.connectedCallback(), this.observe(o(this, s).url$, (t) => {
      this._currentUrl = t, this.requestUpdate();
    }), this.observe(o(this, s).loading$, (t) => {
      this._currentLoading = t, this.requestUpdate();
    }), this.observe(o(this, s).preview$, (t) => {
      this._currentPreview = t, this.requestUpdate();
    }), this.data?.url && (o(this, s).updateUrl(this.data.url), a(this, i, v).call(this));
  }
  renderInput() {
    return u`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._currentUrl}
        @input=${a(this, i, P)}
        required="true"
        ${D()}
        ${q(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${a(this, i, v)}
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
          @click=${a(this, i, x)}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
U = function() {
  this.modalContext?.reject();
};
x = async function() {
  this._submitButtonState = "waiting";
  try {
    if (await o(this, f).validate(), !this._currentPreview) {
      this._submitButtonState = "failed";
      return;
    }
    this._submitButtonState = "success";
    const t = o(this, s).getUrl();
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
  await o(this, s).fetchPreview();
};
P = function(t) {
  o(this, s).updateUrl(t.target.value);
};
n = function(t, e) {
  const r = this.localize.term(t);
  return !r || r === t ? e : r;
};
k = function(t, e) {
  return !t || !e ? d : u`<a href="${t}" target="_blank" rel="noopener noreferrer"
      >${e}</a
    >`;
};
c = function(t, e, r) {
  if (e == null || e === "") return d;
  const l = r ? a(this, i, k).call(this, r, String(e)) : u`<span>${e}</span>`;
  return u`<div class="oembed-details__row">
      <span class="oembed-details__label">${t}</span>
      <span class="oembed-details__value">${l}</span>
    </div>`;
};
C = function(t) {
  const e = t.width && t.height ? `${t.width} × ${t.height}` : null, r = [
    a(this, i, c).call(this, a(this, i, n).call(this, "general_title", "Title"), t.title),
    a(this, i, c).call(this, a(this, i, n).call(this, "general_type", "Type"), t.type),
    a(this, i, c).call(this, a(this, i, n).call(this, "general_author", "Author"), t.authorName, t.authorUrl),
    a(this, i, c).call(this, a(this, i, n).call(this, "general_provider", "Provider"), t.providerName, t.providerUrl),
    a(this, i, c).call(this, a(this, i, n).call(this, "general_dimensions", "Dimensions"), e),
    a(this, i, c).call(this, a(this, i, n).call(this, "general_url", "URL"), t.url, t.url)
  ];
  return r.every((l) => l === d) ? d : u`<umb-property-layout
      label=${a(this, i, n).call(this, "general_details", "Details")}
      orientation="vertical"
    >
      <div slot="editor" class="oembed-details">${r}</div>
    </umb-property-layout>`;
};
E = function(t, e, r, l) {
  return t ? u`<umb-property-layout
      label=${a(this, i, n).call(this, "general_thumbnail", "Thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <img
          class="oembed-thumbnail"
          src="${t}"
          width="${e ?? d}"
          height="${r ?? d}"
          alt="${l ?? ""}"
        />
      </div>
    </umb-property-layout>` : d;
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
p.tagName = "oembed-modal";
p.styles = [
  N,
  S`
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

      .oembed-thumbnail {
        display: block;
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 40vh;
        border-radius: var(--uui-border-radius, 3px);
      }
    `
];
w([
  M()
], p.prototype, "_submitButtonState", 2);
p = w([
  T(p.tagName)
], p);
const X = p;
export {
  p as OembedPickerModalElement,
  X as default
};
//# sourceMappingURL=oembed-picker-modal.element-Clwc00aD.js.map
