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

  static readonly maxDynamicHeight = 600;

  @property({ attribute: false })
  value?: OEmbedPreviewModel;

  /**
   * Contained mode clips the preview to its host bounds instead of auto-sizing
   * to the embed's rendered content. Used inside the property editor card,
   * where the surrounding `uui-card-media` already fixes the aspect ratio.
   */
  @property({ type: Boolean, reflect: true })
  contain = false;

  #frameObservers: ResizeObserver[] = [];

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnectFrameObservers();
  }

  #disconnectFrameObservers() {
    this.#frameObservers.forEach((observer) => observer.disconnect());
    this.#frameObservers = [];
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("value")) {
      this.#disconnectFrameObservers();
    }
  }

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
    const hasFixedSize = aspectRatio > 0;

    const element = window.document.createElement("div");
    element.insertAdjacentHTML("afterbegin", markup);

    let style = "<style>html,body{margin:0;padding:0}</style>";
    if (hasFixedSize) {
      element.style.width = "100%";
      element.style.height = "100%";
      style =
        "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>";
    }

    const srcdoc = `<html><head></head><body>${style}${element.outerHTML}</body></html>`;

    if (hasFixedSize) {
      return html`<div class="oembed-frame" style=${`aspect-ratio:${aspectRatio};`}>
        <iframe
          srcdoc=${srcdoc}
          class="oembed-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>`;
    }

    // Contained surfaces (the card) clip the embed to the host bounds rather
    // than auto-growing, so the preview never overflows neighbouring fields.
    // `scrolling="no"` suppresses the iframe's own scrollbar for taller embeds.
    if (this.contain) {
      return html`<div class="oembed-frame oembed-frame--contained">
        <iframe
          srcdoc=${srcdoc}
          class="oembed-media"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>`;
    }

    // Dynamic-height embeds (e.g. tweets) report no usable height, so size the
    // iframe to its rendered content instead of forcing an aspect ratio.
    return html`<div class="oembed-frame oembed-frame--auto">
      <iframe
        srcdoc=${srcdoc}
        class="oembed-media oembed-media--auto"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        @load=${this.#onAutoFrameLoad}
      ></iframe>
    </div>`;
  }

  #onAutoFrameLoad(event: Event) {
    const iframe = event.target as HTMLIFrameElement;

    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument;
    } catch {
      // Cross-origin documents cannot be measured; leave the default height.
      return;
    }

    const body = doc?.body;
    if (!body) return;

    const resize = () => {
      const height = body.scrollHeight;
      if (height > 0) {
        iframe.style.height = `${Math.min(
          height,
          OEmbedPreviewElement.maxDynamicHeight,
        )}px`;
      }
    };

    resize();

    // Provider scripts (e.g. Twitter's widgets.js) render asynchronously and
    // change the document height after load, so keep the iframe in sync.
    const observer = new ResizeObserver(() => resize());
    observer.observe(body);
    this.#frameObservers.push(observer);
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

    // In contained mode the host (card) renders its own title/detail, so the
    // preview shows only the visual to avoid duplication and extra height.
    return html`${this.#renderVisual(value)}${this.contain
      ? nothing
      : this.#renderMeta(value)}`;
  }

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }

      :host([contain]) {
        height: 100%;
        overflow: hidden;
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

      .oembed-frame--auto {
        background-color: transparent;
      }

      .oembed-media--auto {
        height: 150px;
        max-height: ${OEmbedPreviewElement.maxDynamicHeight}px;
        object-fit: unset;
      }

      .oembed-frame--contained {
        height: 100%;
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
