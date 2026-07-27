import { U as z, a as O } from "./oembed-preview.element-iCC-NFVm.js";
import { html as o, when as m, css as B, state as N, customElement as A, nothing as c } from "@umbraco-cms/backoffice/external/lit";
import { umbFocus as M } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as R } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as D } from "@umbraco-cms/backoffice/style";
import { UmbValidationContext as L, umbBindToValidation as I } from "@umbraco-cms/backoffice/validation";
import { UmbApiError as q } from "@umbraco-cms/backoffice/resources";
const W = {
  ProviderNotSupported: "oembed_errors_ProviderNotSupported",
  EmbedNotFound: "oembed_errors_EmbedNotFound",
  InvalidResponse: "oembed_errors_InvalidResponse"
};
function F(t) {
  if (q.isUmbApiError(t)) {
    const e = t.problemDetails.operationStatus;
    return W[e ?? ""] ?? "oembed_errors_Unknown";
  }
  return "oembed_errors_Unknown";
}
var K = Object.defineProperty, V = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, $ = (t, e, a, l) => {
  for (var h = l > 1 ? void 0 : l ? V(e, a) : e, b = t.length - 1, v; b >= 0; b--)
    (v = t[b]) && (h = (l ? v(e, a, h) : v(h)) || h);
  return l && h && K(e, a, h), h;
}, U = (t, e, a) => e.has(t) || g("Cannot " + a), n = (t, e, a) => (U(t, e, "read from private field"), a ? a.call(t) : e.get(t)), f = (t, e, a) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), r = (t, e, a) => (U(t, e, "access private method"), a), y, s, i, P, _, E, w, k, u, x, d, C, T, S;
let p = class extends R {
  // Provide context to child components
  constructor() {
    super(), f(this, i), f(this, y, new L(this)), f(this, s, new z(this)), this._currentUrl = "", this._currentLoading = "idle", this._currentPreview = void 0, this._currentError = void 0, this.provideContext(O, n(this, s));
  }
  connectedCallback() {
    super.connectedCallback(), this.observe(n(this, s).url$, (t) => {
      this._currentUrl = t, this.requestUpdate();
    }), this.observe(n(this, s).loading$, (t) => {
      this._currentLoading = t, this.requestUpdate();
    }), this.observe(n(this, s).preview$, (t) => {
      this._currentPreview = t, this.requestUpdate();
    }), this.observe(n(this, s).error$, (t) => {
      this._currentError = t, this.requestUpdate();
    }), this.data?.url && (n(this, s).updateUrl(this.data.url), r(this, i, w).call(this));
  }
  renderInput() {
    return o`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._currentUrl}
        @input=${r(this, i, k)}
        required="true"
        ${M()}
        ${I(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${r(this, i, w)}
          label=${this.localize.term("general_retrieve")}
        ></uui-button>
      </uui-input>
    `;
  }
  render() {
    return o`
      <umb-body-layout headline=${this.localize.term("general_embed")}>
        <uui-box>
          <umb-property-layout
            label=${this.localize.term("general_url")}
            orientation="vertical"
          >
            <div slot="editor">${this.renderInput()}</div>
          </umb-property-layout>
          ${m(
      this._currentLoading === "loading",
      () => o`<uui-loader-circle></uui-loader-circle>`
    )}
          ${m(
      this._currentLoading === "success" && this._currentPreview && r(this, i, _).call(this, this._currentPreview.type),
      () => r(this, i, S).call(this, this._currentPreview)
    )}
          ${m(
      this._currentLoading === "success" && this._currentPreview && !r(this, i, _).call(this, this._currentPreview.type),
      () => o`<div class="oembed-error">
              ${this.localize.term(
        "oembed_errors_TypeNotAllowed",
        this._currentPreview.type,
        this.data?.allowedTypes?.join(", ") ?? ""
      )}
            </div>`
    )}
          ${m(
      this._currentLoading === "error",
      () => o`<div class="oembed-error">
              ${this.localize.term(F(this._currentError))}
            </div>`
    )}
        </uui-box>
        <uui-button
          slot="actions"
          id="cancel"
          look="secondary"
          label=${this.localize.term("buttons_confirmActionCancel")}
          @click=${r(this, i, P)}
        ></uui-button>
        <uui-button
          slot="actions"
          id="submit"
          color="positive"
          look="primary"
          .state=${this._submitButtonState}
          label=${this.localize.term("buttons_confirmActionConfirm")}
          @click=${r(this, i, E)}
        ></uui-button>
      </umb-body-layout>
    `;
  }
};
y = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
P = function() {
  this.modalContext?.reject();
};
_ = function(t) {
  const e = this.data?.allowedTypes;
  return !e?.length || !t ? !0 : e.includes(t);
};
E = async function() {
  this._submitButtonState = "waiting";
  try {
    if (await n(this, y).validate(), !this._currentPreview || !r(this, i, _).call(this, this._currentPreview.type)) {
      this._submitButtonState = "failed";
      return;
    }
    this._submitButtonState = "success";
    const t = n(this, s).getUrl();
    this.value = {
      ...this.value,
      oembed: this._currentPreview,
      url: t
    }, this.modalContext?.submit();
  } catch {
    this._submitButtonState = "failed";
  }
};
w = async function() {
  await n(this, s).fetchPreview();
};
k = function(t) {
  n(this, s).updateUrl(t.target.value);
};
u = function(t, e) {
  const a = this.localize.term(t);
  return !a || a === t ? e : a;
};
x = function(t, e) {
  return !t || !e ? c : o`<a href="${t}" target="_blank" rel="noopener noreferrer"
      >${e}</a
    >`;
};
d = function(t, e, a) {
  if (e == null || e === "") return c;
  const l = a ? r(this, i, x).call(this, a, String(e)) : o`<span>${e}</span>`;
  return o`<div class="oembed-details__row">
      <span class="oembed-details__label">${t}</span>
      <span class="oembed-details__value">${l}</span>
    </div>`;
};
C = function(t) {
  const e = t.width && t.height ? `${t.width} × ${t.height}` : null, a = [
    r(this, i, d).call(this, r(this, i, u).call(this, "oembed_details_title", "Title"), t.title),
    r(this, i, d).call(this, r(this, i, u).call(this, "general_type", "Type"), t.type),
    r(this, i, d).call(this, r(this, i, u).call(this, "oembed_details_author", "Author"), t.authorName, t.authorUrl),
    r(this, i, d).call(this, r(this, i, u).call(this, "oembed_details_provider", "Provider"), t.providerName, t.providerUrl),
    r(this, i, d).call(this, r(this, i, u).call(this, "general_dimensions", "Dimensions"), e),
    r(this, i, d).call(this, r(this, i, u).call(this, "general_url", "URL"), t.url, t.url)
  ];
  return a.every((l) => l === c) ? c : o`<umb-property-layout
      label=${r(this, i, u).call(this, "general_details", "Details")}
      orientation="vertical"
    >
      <div slot="editor" class="oembed-details">${a}</div>
    </umb-property-layout>`;
};
T = function(t, e, a, l) {
  return t ? o`<umb-property-layout
      label=${r(this, i, u).call(this, "oembed_details_thumbnail", "Thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <img
          class="oembed-thumbnail"
          src="${t}"
          width="${e ?? c}"
          height="${a ?? c}"
          alt="${l ?? ""}"
        />
      </div>
    </umb-property-layout>` : c;
};
S = function(t) {
  return o`
      <umb-property-layout
        label=${this.localize.term("general_preview")}
        orientation="vertical"
      >
        <div slot="editor">
          <oembed-preview .value="${t}"></oembed-preview>
        </div>
      </umb-property-layout>
      ${r(this, i, C).call(this, t)}
      ${r(this, i, T).call(this, t.thumbnailUrl, t.thumbnailWidth, t.thumbnailHeight, t.title)}
    `;
};
p.tagName = "oembed-modal";
p.styles = [
  D,
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

      .oembed-error {
        color: var(--uui-color-danger, #d42054);
      }
    `
];
$([
  N()
], p.prototype, "_submitButtonState", 2);
p = $([
  A(p.tagName)
], p);
const Z = p;
export {
  p as OembedPickerModalElement,
  Z as default
};
//# sourceMappingURL=oembed-picker-modal.element-CU5reptc.js.map
