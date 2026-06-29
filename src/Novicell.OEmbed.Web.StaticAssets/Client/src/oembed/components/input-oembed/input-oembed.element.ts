import {
  css,
  html,
  customElement,
  nothing,
  property,
  when,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UmbFormControlMixin } from "@umbraco-cms/backoffice/validation";

import { OEmbedValueModel } from "../../../property-editors/types.ts";
import "../oembed-preview/index.ts";
import { UmbOEmbedPickerContext } from "../../modals/oembed-picker/oembed-picker.context.ts";
import { UMB_OEMBED_PICKER_CONTEXT } from "../../modals/oembed-picker/oembed-picker.context.token.ts";

@customElement(InputOEmbedElement.tagName)
export class InputOEmbedElement
  extends UmbFormControlMixin<
    OEmbedValueModel,
    typeof UmbLitElement,
    undefined
  >(UmbLitElement)
  implements UmbPropertyEditorUiElement
{
  static readonly tagName = "input-oembed";

  /**
   * Sets the input to required, meaning validation will fail if the value is empty.
   * @type {boolean}
   */
  @property({ type: Boolean })
  required?: boolean;

  @property({ type: String })
  requiredMessage?: string;

  /**
   * Sets the input to readonly mode, meaning value cannot be changed but still able to read and select its content.
   * @type {boolean}
   * @attr
   * @default
   */
  @property({ type: Boolean, reflect: true })
  readonly?: boolean;

  readonly #pickerContext = new UmbOEmbedPickerContext(this);

  constructor() {
    super();
    // Provider side: expose the context to this element's subtree and to our
    // own observers. The context owns the value and opens the picker modal.
    this.provideContext(UMB_OEMBED_PICKER_CONTEXT, this.#pickerContext);
  }

  override connectedCallback() {
    super.connectedCallback();

    // Seed the context with the already-persisted value so the first emission
    // matches and the guard below skips it (no spurious change on load).
    if (this.value) {
      this.#pickerContext.setValue(this.value);
    }

    // Observer side: mirror committed picker values into the form-control value.
    this.observe(
      this.#pickerContext.value$,
      (value) => {
        if (value === this.value) return; // ignore the seeded/initial emission
        this.value = value;
        this.dispatchEvent(new UmbChangeEvent());
      },
      "_oembedPickerValue",
    );
  }

  #hasValue(value?: OEmbedValueModel): value is OEmbedValueModel {
    return Boolean(value?.url && value?.oembed?.type);
  }

  async #openPicker(url?: string) {
    // The context opens the modal and commits the value; our value$ observer
    // mirrors it into this.value and dispatches the change event.
    await this.#pickerContext.openPicker(url);
  }

  async #onRemove() {
    try {
      await this.requestRemoveItem(this.value!);
      this.#pickerContext.clearValue();
    } catch {
      // User cancelled the action
    }
  }

  async requestRemoveItem(value: OEmbedValueModel) {
    const title = value.oembed.title || value.url;
    await umbConfirmModal(this, {
      color: "danger",
      headline: `#actions_remove ${title}?`,
      content: `#defaultdialogs_confirmremove ${title}?`,
      confirmLabel: "#actions_remove",
    });
  }

  #renderActions() {
    if (this.readonly) return nothing;
    return html`
      <uui-action-bar slot="actions">
        <uui-button
          label=${this.localize.term("general_remove")}
          look="secondary"
          @click=${() => this.#onRemove()}
        >
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </uui-action-bar>
    `;
  }

  #detail(oembed: OEmbedValueModel["oembed"]): string {
    return [oembed.providerName, oembed.authorName].filter(Boolean).join(" · ");
  }

  #dimensions(oembed: OEmbedValueModel["oembed"]): {
    width?: number;
    height?: number;
  } {
    if (oembed.thumbnailWidth && oembed.thumbnailHeight) {
      return { width: oembed.thumbnailWidth, height: oembed.thumbnailHeight };
    }
    if (oembed.width && oembed.height) {
      return { width: oembed.width, height: oembed.height };
    }

    // Type can arrive in mixed casing from stored data, so normalise first.
    switch (oembed.type?.toLowerCase()) {
      case "photo":
        return { width: 4, height: 3 };
      // TODO: determine sensible fallbacks for "rich" and "link" once those
      // types are reviewed; defaulting to 16:9 for now.
      case "video":
      default:
        return { width: 16, height: 9 };
    }
  }

  #renderPreview(value: OEmbedValueModel) {
    if (value.oembed.thumbnailUrl) {
      return html`<img
        src=${value.oembed.thumbnailUrl}
        alt=${value.oembed.title ?? value.url}
      />`;
    }
    return html`<oembed-preview
      contain
      .value="${value.oembed}"
    ></oembed-preview>`;
  }

  #renderOEmbed(value: OEmbedValueModel) {
    const { width, height } = this.#dimensions(value.oembed);
    const aspectRatio = width && height ? width / height : 0;
    return html`
      <uui-card-media
        style=${aspectRatio >= 1 && aspectRatio < 2
          ? `aspect-ratio: ${width} / ${height}`
          : ""}
        .name=${value.oembed.title ?? value.url}
        .detail=${this.#detail(value.oembed)}
        .selectonly="true"
        .selectable="false"
        @open="${() => this.#openPicker(value.url)}"
        ?readonly=${this.readonly}
      >
        ${this.#renderPreview(value)} ${this.#renderActions()}
      </uui-card-media>
    `;
  }

  #renderAddButton() {
    if (this.readonly && this.#hasValue(this.value)) return nothing;

    return html`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
          this.pristine = false;
          this.checkValidity();
        }}
        @click=${() => this.#openPicker("")}
        label=${this.localize.term("general_choose")}
        ?disabled=${this.readonly}
      >
        <uui-icon name="icon-add"></uui-icon>
        ${this.localize.term("general_choose")}
      </uui-button>
    `;
  }

  override render() {
    return html`<div class="container">
      ${when(this.#hasValue(this.value), () => this.#renderOEmbed(this.value!))}
      ${this.#renderAddButton()}
    </div>`;
  }

  static styles = [
    css`
      :host {
        position: relative;
      }

      .container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-5);
        align-items: flex-start;
        min-height: var(--umb-card-medium-min-width);
      }

      uui-card-media {
        height: var(--umb-card-medium-min-width);
        width: auto;
        /* aspect-ratio set inline per card */
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
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
        background-size: 10px 10px;
        background-repeat: repeat;
      }
    `,
  ];
}

export default InputOEmbedElement;

declare global {
  interface HTMLElementTagNameMap {
    [InputOEmbedElement.tagName]: InputOEmbedElement;
  }
}
