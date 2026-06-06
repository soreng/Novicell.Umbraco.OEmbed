import "./client.gen-C8It7zoJ.js";
import "@umbraco-cms/backoffice/resources";
import { OEmbedRepository as G } from "./oembed.repository-BlzFYhmR.js";
import { css as S, query as V, property as J, customElement as z, nothing as c, when as v, html as l, state as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as K, umbFocus as Q } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as X } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as Y } from "@umbraco-cms/backoffice/style";
import { UmbValidationContext as Z, umbBindToValidation as j } from "@umbraco-cms/backoffice/validation";
var ee = Object.defineProperty, te = Object.getOwnPropertyDescriptor, U = (e) => {
  throw TypeError(e);
}, $ = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? te(t, i) : t, s = e.length - 1, u; s >= 0; s--)
    (u = e[s]) && (r = (o ? u(t, i, r) : u(r)) || r);
  return o && r && ee(t, i, r), r;
}, W = (e, t, i) => t.has(e) || U("Cannot " + i), x = (e, t, i) => (W(e, t, "read from private field"), i ? i.call(e) : t.get(e)), M = (e, t, i) => t.has(e) ? U("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), P = (e, t, i) => (W(e, t, "access private method"), i), f, _, L, B;
let h = class extends K {
  constructor() {
    super(...arguments), M(this, _), M(this, f, new MutationObserver((e, t) => {
      var i = this.onMutation;
      e.forEach(function(o) {
        i(o, t);
      });
    }));
  }
  // use the connectedCallback as suggested by Jacob Overgaard as this is where the this.value is available and assigned
  connectedCallback() {
    super.connectedCallback();
  }
  /**
   * Updated runs every time the element renders, so it's well-
   * suited for managing light DOM children, or anything else that you
   * don't directly control in your template.
   * @param  {Map<string, any>} changedProperties
   */
  updated(e) {
    console.log("updated", e), super.updated(e);
  }
  onMutation(e, t) {
    console.log("mutation", e, t);
  }
  render() {
    const e = this.value;
    return e === void 0 ? c : v(
      e.type == "photo",
      () => P(this, _, L).call(this, e.url, e.width, e.height),
      () => P(this, _, B).call(this, e.html, e.width, e.height)
    );
  }
};
f = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakSet();
L = function(e, t, i) {
  return l`<img 
                class="oembed-photo"
                src="${e}"
                width="${t}"
                height="${i}"/>`;
};
B = function(e, t, i) {
  x(this, f).takeRecords(), x(this, f).disconnect();
  const o = t && i ? t / i : 0;
  var r = window.document.createElement("div");
  r.insertAdjacentHTML("afterbegin", e);
  let s = "";
  o > 0 && (r.style.width = "100%", r.style.height = "100%", s = "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow: hidden}</style>");
  const u = `<html><head></head><body>${s}${r.outerHTML}</body></html>`;
  return l`
            <iframe
                    srcdoc="${u}"
                    class="oembed-frame"
                    style="${o > 0 ? "aspect-ratio:" + o + ";" : ""}"
                    onload="this.#observer.observe(this.#frame)"
                    sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>`;
};
h.tagName = "oembed-preview";
h.styles = [
  S`
            .oembed-frame,
            .oembed-photo {
                max-width: 100%;
            }

            .oembed-frame{
                margin: 0;
                width: 100%;
                border: none;
                //height: 0;
                //border:2px solid deeppink;
            }
            
            .oembed-photo{
                height: auto;
                //border:2px solid greenyellow;
            }

            .oembed-container {
                max-width: 100%;
                width: 100%;
            }

            .novicell-oembed-preview__container--fixed-ratio {
                position: relative;
                padding-top: 0;
            }

            .novicell-oembed-preview .novicell-oembed-preview__frame {
                width: 100%;
                height: 0;
            }

            .novicell-oembed-preview
            .novicell-oembed-preview__container--fixed-ratio
            .novicell-oembed-preview__frame {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                height: 100%;
            }

            .novicell-oembed-preview .__info {
                position: unset;
                opacity: unset;
            }
        `
];
$([
  V(".oembed-frame")
], h.prototype, "frame", 2);
$([
  J()
], h.prototype, "value", 2);
h = $([
  z(h.tagName)
], h);
var ie = Object.defineProperty, re = Object.getOwnPropertyDescriptor, N = (e) => {
  throw TypeError(e);
}, p = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? re(t, i) : t, s = e.length - 1, u; s >= 0; s--)
    (u = e[s]) && (r = (o ? u(t, i, r) : u(r)) || r);
  return o && r && ie(t, i, r), r;
}, C = (e, t, i) => t.has(e) || N("Cannot " + i), y = (e, t, i) => (C(e, t, "read from private field"), i ? i.call(e) : t.get(e)), m = (e, t, i) => t.has(e) ? N("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), oe = (e, t, i, o) => (C(e, t, "write to private field"), t.set(e, i), i), n = (e, t, i) => (C(e, t, "access private method"), i), E, k, b, a, T, A, g, D, O, I, R, q, H, F;
let d = class extends X {
  constructor() {
    super(...arguments), m(this, a), m(this, E, new Z(this)), m(this, k, new G(this)), m(this, b), this._error = void 0, this._url = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.data?.url && (this._url = this.data.url, n(this, a, g).call(this));
  }
  renderInput() {
    return l`
            <uui-input 
                    id="url"
                    data-mark="input:url"
                    label=${this.localize.term("placeholders_enterUrl")}
                    placeholder=${this.localize.term("placeholders_enterUrl")}
                    .value=${this._url}
                    @input=${n(this, a, D)}
                    required="true"
                   ${Q()}
                   ${j(this)}>
                <uui-button
                        slot="append"
                        look="primary"
                        color="positive"
                        @click=${n(this, a, g)}
                        label=${this.localize.term("general_retrieve")}></uui-button>
            </uui-input>
        `;
  }
  render() {
    return l`
            <umb-body-layout headline="Embed">
                <uui-box>
                    <umb-property-layout label=${this.localize.term("general_url")} orientation="vertical">
                        <div slot="editor">${this.renderInput()}</div>
                    </umb-property-layout>
                    ${v(this._loading === "failed", () => n(this, a, F).call(this))}
                    ${v(this._loading === "waiting", () => l`<uui-loader-circle></uui-loader-circle>`)}
                    ${v(this._loading === "success", () => n(this, a, H).call(this, this.value.oembed))}
                </uui-box>
                <uui-button
                        slot="actions"
                        id="cancel"
                        look="secondary"
                        label=${this.localize.term("buttons_confirmActionCancel")}
                        @click=${n(this, a, T)}></uui-button>
                <uui-button
                        slot="actions"
                        id="submit"
                        color="positive"
                        look="primary"
                        .state=${this._submitButtonState}
                        label=${this.localize.term("buttons_confirmActionConfirm")}
                        @click=${n(this, a, A)}></uui-button>
            </umb-body-layout>
        `;
  }
};
E = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
T = function() {
  this.modalContext?.reject();
};
A = async function() {
  this._submitButtonState = "waiting";
  try {
    await y(this, E).validate(), this._submitButtonState = "success", this.modalContext?.submit();
  } catch {
    this._submitButtonState = "failed";
  }
};
g = async function() {
  this._loading = "waiting";
  const { data: e, error: t } = await y(this, k).requestOEmbed({
    url: this._url
    //maxWidth: this._width > 0 ? this._width : undefined,
    //maxHeight: this._height > 0 ? this._height : undefined,
  });
  e ? (oe(this, b, this._url), this.value = {
    ...this.value,
    oembed: {
      ...e
    },
    url: y(this, b)
  }, this._error = void 0) : this._error = t || void 0, this._loading = this._error === void 0 ? "success" : "failed";
};
D = function(e) {
  this._url = e.target.value;
};
O = function(e, t) {
  return !e || !t ? c : l`<a href="${e}" target="_blank" rel="noopener noreferrer">${t}</a>`;
};
I = function(e, t) {
  return !e || !t ? c : l`<span>${this.localize.term("general_by").toLocaleLowerCase()} ${n(this, a, O).call(this, t, e)}</span>`;
};
R = function(e, t) {
  return !e || !t ? c : l`<span>${this.localize.term("general_on").toLocaleLowerCase()} ${n(this, a, O).call(this, t, e)}</span>`;
};
q = function(e, t, i, o) {
  return e ? l`<umb-property-layout
                label=${this.localize.term("general_thumbnail")}
                orientation="vertical">
            <div slot="editor"><div><img src="${e}" width="${t}" height="${i}" alt="${o}" /></div></div>
        </umb-property-layout>` : c;
};
H = function(e) {
  return l`
            <umb-property-layout
                    label=${this.localize.term("general_preview")}
                    orientation="vertical">
                <div slot="editor">
                    <oembed-preview .value="${e}"></oembed-preview>
                    <div>${e.title}</div>
                    <small slot="detail">
                        ${n(this, a, I).call(this, e.authorName, e.authorUrl)}
                        ${n(this, a, R).call(this, e.providerName, e.providerUrl)}
                    </small>
                </div>
            </umb-property-layout>
            ${n(this, a, q).call(this, null, e.thumbnailWidth, e.thumbnailHeight, e.title)}
        `;
};
F = function() {
  return l`<div class="">${JSON.stringify(this._error)}</div>`;
};
d.tagName = "oembed-modal";
d.styles = [
  Y,
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
        `
];
p([
  w()
], d.prototype, "_loading", 2);
p([
  w()
], d.prototype, "_error", 2);
p([
  w()
], d.prototype, "_url", 2);
p([
  w()
], d.prototype, "_submitButtonState", 2);
d = p([
  z(d.tagName)
], d);
const pe = d;
export {
  d as OembedPickerModalElement,
  pe as default
};
//# sourceMappingURL=oembed-picker-modal.element-CS1vHImF.js.map
