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
import { umbOpenModal, umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UmbFormControlMixin } from "@umbraco-cms/backoffice/validation";

import { OEmbedValueModel } from "../../../property-editors/types.ts";
import "../oembed-preview/index.ts";
import { OEMBED_MODAL } from "../../modals/oembed-picker/oembed-picker-modal.token.ts";

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

  #hasRenderableValue(value?: OEmbedValueModel): value is OEmbedValueModel {
    const hasRenderableValue = Boolean(value?.url && value?.oembed?.type);
    return hasRenderableValue;
  }

  async #openPicker(url?: string) {
    const value = await umbOpenModal(this, OEMBED_MODAL, {
      data: {
        url: url,
        //types: ['video', 'rich', 'photo', 'link'],
      },
    }).catch(() => undefined);
    if (!value) return;

    this.value = {
      ...value,
    };

    this.dispatchEvent(new UmbChangeEvent());
  }

  async #onRemove() {
    try {
      await this.requestRemoveItem(this.value!);
      this.value = undefined;
      this.dispatchEvent(new UmbChangeEvent());
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

  #renderOEmbed(value: OEmbedValueModel) {
    return html`
      <uui-card-media
        .name=${value.oembed.title}
        .selectonly="true"
        .selectable="false"
        @open="${() => this.#openPicker(value.url)}"
        ?readonly=${this.readonly}
      >
        <oembed-preview .value="${value.oembed}"></oembed-preview>
        ${this.#renderActions()}
      </uui-card-media>
    `;
  }

  #renderAddButton() {
    if (this.readonly || this.#hasRenderableValue(this.value)) return nothing;

    return html`
      <uui-button
        id="btn-add"
        look="placeholder"
        @blur=${() => {
          this.pristine = false;
          this.checkValidity();
        }}
        @click=${() => this.#openPicker()}
        label=${this.localize.term("general_choose")}
        ?disabled=${this.readonly}
      >
        <uui-icon name="icon-add"></uui-icon>
        ${this.localize.term("general_choose")}
      </uui-button>
    `;
  }

  override render() {
    const hasRenderableValue = this.#hasRenderableValue(this.value);
    return html`<div class="container">
      ${when(
        hasRenderableValue,
        () => this.#renderOEmbed(this.value!),
        () => this.#renderAddButton(),
      )}
    </div>`;
  }

  static styles = [
    css`
      :host {
        position: relative;
      }

      .container {
        display: grid;
        gap: var(--uui-size-space-5);
        grid-template-columns: repeat(
          auto-fill,
          minmax(var(--umb-card-medium-min-width), 1fr)
        );
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
    `,
  ];
}

export default InputOEmbedElement;

declare global {
  interface HTMLElementTagNameMap {
    [InputOEmbedElement.tagName]: InputOEmbedElement;
  }
}
