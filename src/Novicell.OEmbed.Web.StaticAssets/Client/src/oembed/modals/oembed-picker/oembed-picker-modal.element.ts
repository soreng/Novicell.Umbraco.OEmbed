import { UmbOEmbedPickerContext } from "./oembed-picker.context";
import { UMB_OEMBED_PICKER_CONTEXT } from "./oembed-picker.context.token";
import type {
  OEmbedModalData,
  OEmbedModalValue,
} from "./oembed-picker-modal.token.ts";
import {
  css,
  html,
  when,
  customElement,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import type {
  UUIButtonState,
  UUIInputEvent,
} from "@umbraco-cms/backoffice/external/uui";
import { umbFocus } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";

import "../../components/oembed-preview/oembed-preview.element.ts";
import { UmbApiError, UmbCancelError } from "@umbraco-cms/backoffice/resources";
import { OEmbedResponseModel } from "../../../api";
import {
  umbBindToValidation,
  UmbValidationContext,
} from "@umbraco-cms/backoffice/validation";

@customElement(OembedPickerModalElement.tagName)
export class OembedPickerModalElement extends UmbModalBaseElement<
  OEmbedModalData,
  OEmbedModalValue
> {
  static readonly tagName = "oembed-modal";

  readonly #validation = new UmbValidationContext(this);
  readonly #pickerContext = new UmbOEmbedPickerContext(this);

  // Provide context to child components
  constructor() {
    super();
    this.provideContext(UMB_OEMBED_PICKER_CONTEXT, this.#pickerContext);
  }

  @state()
  private _submitButtonState: UUIButtonState;

  // Observables from context store (for rendering)
  private _currentUrl = "";
  private _currentLoading: string = "idle";
  private _currentError: UmbApiError | UmbCancelError | undefined = undefined;
  private _currentPreview: OEmbedResponseModel | undefined = undefined;
  private _validUrl?: string;

  override connectedCallback() {
    super.connectedCallback();

    // Subscribe to context observables for re-rendering
    this.observe(this.#pickerContext.url$, (url) => {
      this._currentUrl = url;
      this.requestUpdate();
    });

    this.observe(this.#pickerContext.loading$, (loading) => {
      this._currentLoading = loading;
      this.requestUpdate();
    });

    this.observe(this.#pickerContext.error$, (error) => {
      this._currentError = error;
      this.requestUpdate();
    });

    this.observe(this.#pickerContext.preview$, (preview) => {
      this._currentPreview = preview;
      this.requestUpdate();
    });

    // Initialize with data if provided
    if (this.data?.url) {
      this.#pickerContext.updateUrl(this.data.url);
      this.#getPreview();
    }
  }

  #close() {
    this.modalContext?.reject();
  }

  async #submit() {
    this._submitButtonState = "waiting";

    try {
      await this.#validation.validate();
      this._submitButtonState = "success";

      // Get the current URL from context
      const url = this.#pickerContext.getUrl();
      this.value = {
        ...this.value,
        oembed: this._currentPreview,
        url: url,
      };

      this.modalContext?.submit();
    } catch {
      this._submitButtonState = "failed";
    }
  }

  async #getPreview() {
    await this.#pickerContext.fetchPreview();
  }

  #onUrlChange(e: UUIInputEvent) {
    this.#pickerContext.updateUrl(e.target.value as string);
  }

  #renderLink(url?: string | null, text?: string | null) {
    if (!url || !text) return nothing;
    return html`<a href="${url}" target="_blank" rel="noopener noreferrer"
      >${text}</a
    >`;
  }

  #renderAuthor(name?: string | null, url?: string | null) {
    if (!name || !url) return nothing;
    return html`<span
      >${this.localize.term("general_by").toLocaleLowerCase()}
      ${this.#renderLink(url, name)}</span
    >`;
  }

  #renderProvider(name?: string | null, url?: string | null) {
    if (!name || !url) return nothing;
    return html`<span
      >${this.localize.term("general_on").toLocaleLowerCase()}
      ${this.#renderLink(url, name)}</span
    >`;
  }

  #renderThumbnail(
    url?: string | null,
    width?: number | null,
    height?: number | null,
    alt?: string | null,
  ) {
    if (!url) return nothing;
    return html`<umb-property-layout
      label=${this.localize.term("general_thumbnail")}
      orientation="vertical"
    >
      <div slot="editor">
        <div>
          <img src="${url}" width="${width}" height="${height}" alt="${alt}" />
        </div>
      </div>
    </umb-property-layout>`;
  }

  #renderPreview(oembed: OEmbedResponseModel) {
    return html`
      <umb-property-layout
        label=${this.localize.term("general_preview")}
        orientation="vertical"
      >
        <div slot="editor">
          <oembed-preview .value="${oembed}"></oembed-preview>
          <div>${oembed.title}</div>
          <small slot="detail">
            ${this.#renderAuthor(oembed.authorName, oembed.authorUrl)}
            ${this.#renderProvider(oembed.providerName, oembed.providerUrl)}
          </small>
        </div>
      </umb-property-layout>
      ${this.#renderThumbnail(
        oembed.thumbnailUrl,
        oembed.thumbnailWidth,
        oembed.thumbnailHeight,
        oembed.title,
      )}
    `;
  }

  renderInput() {
    return html`
      <uui-input
        id="url"
        data-mark="input:url"
        label=${this.localize.term("placeholders_enterUrl")}
        placeholder=${this.localize.term("placeholders_enterUrl")}
        .value=${this._currentUrl}
        @input=${this.#onUrlChange}
        required="true"
        ${umbFocus()}
        ${umbBindToValidation(this)}
      >
        <uui-button
          slot="append"
          look="primary"
          color="positive"
          @click=${this.#getPreview}
          label=${this.localize.term("general_retrieve")}
        ></uui-button>
      </uui-input>
    `;
  }

  override render() {
    return html`
      <umb-body-layout headline="Embed">
        <uui-box>
          <umb-property-layout
            label=${this.localize.term("general_url")}
            orientation="vertical"
          >
            <div slot="editor">${this.renderInput()}</div>
          </umb-property-layout>
          ${when(
            this._currentLoading === "loading",
            () => html`<uui-loader-circle></uui-loader-circle>`,
          )}
          ${when(
            this._currentLoading === "success" && this._currentPreview,
            () => this.#renderPreview(this._currentPreview!),
          )}
        </uui-box>
        <uui-button
          slot="actions"
          id="cancel"
          look="secondary"
          label=${this.localize.term("buttons_confirmActionCancel")}
          @click=${this.#close}
        ></uui-button>
        <uui-button
          slot="actions"
          id="submit"
          color="positive"
          look="primary"
          .state=${this._submitButtonState}
          label=${this.localize.term("buttons_confirmActionConfirm")}
          @click=${this.#submit}
        ></uui-button>
      </umb-body-layout>
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
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
    `,
  ];
}

export default OembedPickerModalElement;

declare global {
  interface HTMLElementTagNameMap {
    "oembed-modal": OembedPickerModalElement;
  }
}
