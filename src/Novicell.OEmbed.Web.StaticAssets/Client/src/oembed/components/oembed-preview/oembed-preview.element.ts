import {
  css,
  html,
  customElement,
  nothing,
  property,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { OEmbedType } from "../../../api";

export interface OEmbedPreviewModel {
  type: OEmbedType;
  html?: string | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
  providerName?: string | null;
  providerUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailWidth?: number | null;
  thumbnailHeight?: number | null;
}

@customElement(OEmbedPreviewElement.tagName)
export class OEmbedPreviewElement
  extends UmbLitElement
  implements UmbPropertyEditorUiElement
{
  static readonly tagName = "oembed-preview";

  @property({ attribute: false })
  value?: OEmbedPreviewModel;

  #normalizedType(type: OEmbedType): string {
    // The Management API may serialize the type as PascalCase (e.g. "Photo")
    // while the generated contract uses lowercase spec values. Normalize so the
    // preview branches correctly regardless of casing.
    return String(type).toLowerCase();
  }

  #aspectRatio(width?: number | null, height?: number | null): number {
    return width && height ? width / height : 0;
  }

  #renderImage(value: OEmbedPreviewModel) {
    const url = value.url ?? value.thumbnailUrl;
    if (!url) return this.#renderThumbnailCard(value);

    const aspectRatio = this.#aspectRatio(value.width, value.height);
    return html`<div
      class="oembed-frame"
      style=${aspectRatio > 0 ? `aspect-ratio:${aspectRatio};` : nothing}
    >
      <img class="oembed-media" src=${url} alt=${value.title ?? ""} />
    </div>`;
  }

  #renderThumbnailCard(value: OEmbedPreviewModel) {
    const thumbnail = value.thumbnailUrl;
    if (!thumbnail) return nothing;

    const aspectRatio = this.#aspectRatio(
      value.thumbnailWidth,
      value.thumbnailHeight,
    );
    return html`<div
      class="oembed-frame"
      style=${aspectRatio > 0 ? `aspect-ratio:${aspectRatio};` : nothing}
    >
      <img class="oembed-media" src=${thumbnail} alt=${value.title ?? ""} />
    </div>`;
  }

  #renderIFrame(value: OEmbedPreviewModel) {
    const markup = value.html;
    if (!markup) return this.#renderThumbnailCard(value);

    const aspectRatio = this.#aspectRatio(value.width, value.height);

    const element = window.document.createElement("div");
    element.insertAdjacentHTML("afterbegin", markup);

    let style = "";
    if (aspectRatio > 0) {
      element.style.width = "100%";
      element.style.height = "100%";
      style =
        "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>";
    }

    const srcdoc = `<html><head></head><body>${style}${element.outerHTML}</body></html>`;

    return html`<div
      class="oembed-frame"
      style=${aspectRatio > 0 ? `aspect-ratio:${aspectRatio};` : nothing}
    >
      <iframe
        srcdoc=${srcdoc}
        class="oembed-media"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>
    </div>`;
  }

  #renderMeta(value: OEmbedPreviewModel) {
    const detail = [value.providerName, value.authorName]
      .filter(Boolean)
      .join(" · ");

    if (!value.title && !detail) return nothing;

    return html`<div class="oembed-meta">
      ${value.title
        ? html`<span class="oembed-meta__title" title=${value.title}
            >${value.title}</span
          >`
        : nothing}
      ${detail
        ? html`<small class="oembed-meta__detail">${detail}</small>`
        : nothing}
    </div>`;
  }

  #renderVisual(value: OEmbedPreviewModel) {
    switch (this.#normalizedType(value.type)) {
      case "photo":
        return this.#renderImage(value);
      case "link":
        return this.#renderThumbnailCard(value);
      default:
        return this.#renderIFrame(value);
    }
  }

  render() {
    const value = this.value;
    if (!value) return nothing;

    return html`${this.#renderVisual(value)}${this.#renderMeta(value)}`;
  }

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }

      .oembed-frame {
        position: relative;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        border-radius: var(--uui-border-radius, 3px);
        background-color: var(--uui-color-surface-alt, #f3f3f5);
      }

      .oembed-media {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        object-fit: cover;
      }

      .oembed-meta {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-1, 3px);
        padding-top: var(--uui-size-space-2, 6px);
      }

      .oembed-meta__title {
        font-weight: var(--uui-font-weight-bold, 700);
        color: var(--uui-color-text, #1b264f);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .oembed-meta__detail {
        color: var(--uui-color-text-alt, #515763);
      }
    `,
  ];
}

export { OEmbedPreviewElement as default };

declare global {
  interface HTMLElementTagNameMap {
    [OEmbedPreviewElement.tagName]: OEmbedPreviewElement;
  }
}
