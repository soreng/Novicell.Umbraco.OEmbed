import {
  css,
  html,
  customElement,
  keyed,
  nothing,
  property,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import type { OEmbedResponseModel, OEmbedType } from "../../../api";
import {
  effectiveSandbox,
  parseProviderFrame,
  type ProviderFrame,
} from "../../provider-frame.ts";

/**
 * Sandbox for a provider's own iframe, rendered directly. The frame is cross-origin from the
 * backoffice, so `allow-same-origin` only lets it keep its own origin (YouTube and others need
 * storage access); it cannot reach the backoffice.
 */
const PROVIDER_FRAME_SANDBOX = [
  "allow-scripts",
  "allow-same-origin",
  "allow-presentation",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
];

@customElement(OEmbedPreviewElement.tagName)
export class OEmbedPreviewElement
  extends UmbLitElement
  implements UmbPropertyEditorUiElement
{
  static readonly tagName = "oembed-preview";

  static readonly maxDynamicHeight = 600;

  @property({ attribute: false })
  value?: OEmbedResponseModel;

  /**
   * Live mode runs the provider's own markup (an iframe, or a script-based embed in a sandbox).
   * Set it only for a response the server has just fetched from a provider, such as the
   * picker modal's preview. A saved value comes from the client and is shown to every editor
   * who opens the content, so without this flag its markup is never run: the preview shows a
   * thumbnail or link card instead.
   */
  @property({ type: Boolean })
  live = false;

  /**
   * The URL the embed was created from. Shown as plain text on the link card when the response
   * itself has no title or URL, so saved embeds can be told apart. Never used as a link.
   */
  @property({ attribute: false })
  sourceUrl?: string;

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

  override willUpdate(
    changedProperties: Map<string | number | symbol, unknown>,
  ) {
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

  #renderImage(value: OEmbedResponseModel) {
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

  #renderThumbnailCard(value: OEmbedResponseModel) {
    const thumbnail = value.thumbnailUrl;
    if (!thumbnail) return this.#renderLinkCard(value);

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

  #renderLinkCard(value: OEmbedResponseModel) {
    const href = value.url ?? this.sourceUrl ?? undefined;
    let hostname = value.providerName ?? "";
    if (!hostname && href) {
      try {
        hostname = new URL(href).hostname;
      } catch {
        // Leave hostname empty if the URL cannot be parsed.
      }
    }

    return html`<div class="oembed-link-card">
      <uui-icon name="icon-link"></uui-icon>
      <div class="oembed-link-info">
        <span class="oembed-link-title">${value.title ?? href ?? ""}</span>
        ${hostname
          ? html`<span class="oembed-link-host">${hostname}</span>`
          : nothing}
      </div>
    </div>`;
  }

  #renderProviderFrame(value: OEmbedResponseModel, frame: ProviderFrame) {
    // A sandbox only applies when a document is loaded. keyed() makes Lit replace the iframe
    // instead of reusing it when the sandbox or src changes, so a stricter sandbox takes
    // effect rather than being set on an already loaded document.
    const sandbox = effectiveSandbox(frame.sandbox, PROVIDER_FRAME_SANDBOX);
    const iframe = (className: string, style?: string) =>
      keyed(
        `${sandbox}|${frame.src}`,
        html`<iframe
          class=${className}
          src=${frame.src}
          sandbox=${sandbox}
          allow=${frame.allow ?? nothing}
          referrerpolicy=${frame.referrerPolicy ?? nothing}
          ?allowfullscreen=${frame.allowFullscreen}
          title=${frame.title ?? value.title ?? ""}
          style=${style ?? nothing}
        ></iframe>`,
      );

    const aspectRatio = this.#aspectRatio(value.width, value.height);
    if (aspectRatio > 0) {
      return html`<div
        class="oembed-frame"
        style=${`aspect-ratio:${aspectRatio};`}
      >
        ${iframe("oembed-media")}
      </div>`;
    }

    if (this.contain) {
      return html`<div class="oembed-frame oembed-frame--contained">
        ${iframe("oembed-media")}
      </div>`;
    }

    const height = Math.min(
      frame.height ?? 0,
      OEmbedPreviewElement.maxDynamicHeight,
    );
    return html`<div class="oembed-frame oembed-frame--auto">
      ${iframe(
        "oembed-media oembed-media--auto",
        height > 0 ? `height:${height}px` : undefined,
      )}
    </div>`;
  }

  #renderIFrame(value: OEmbedResponseModel) {
    const markup = value.html;
    if (!markup || !this.live) return this.#renderThumbnailCard(value);

    // A lone iframe on another origin is rendered as a normal, cross-origin iframe, so the
    // provider keeps its own origin without sharing the backoffice's. Any other markup
    // (typically a blockquote plus the provider's script) needs the srcdoc below.
    const providerFrame = parseProviderFrame(markup, window.location.origin);
    if (providerFrame) return this.#renderProviderFrame(value, providerFrame);

    const aspectRatio = this.#aspectRatio(value.width, value.height);
    const hasFixedSize = aspectRatio > 0;

    // The provider's markup is untrusted. It only ever ends up inside the srcdoc string and is
    // parsed by the iframe. It must never be parsed into an element of the backoffice document:
    // even a detached element runs handlers such as <img onerror> with backoffice privileges.
    let style = "<style>html,body{margin:0;padding:0}</style>";
    let wrapperStyle = "";
    if (hasFixedSize) {
      wrapperStyle = ' style="width:100%;height:100%"';
      style =
        "<style>html,body,iframe{width:100%;height:100%;margin:0;padding:0;overflow:hidden}</style>";
    }

    // The sandboxes below keep allow-same-origin on purpose. These providers' scripts (X, TikTok,
    // Reddit) open nested frames that inherit the sandbox and fail without storage access, and
    // the preview measures the frame's height from the parent. The registered embed providers
    // are therefore the trust boundary; Autodiscover widens it (see the README).
    const srcdoc = `<html><head></head><body>${style}<div${wrapperStyle}>${markup}</div></body></html>`;

    if (hasFixedSize) {
      return html`<div
        class="oembed-frame"
        style=${`aspect-ratio:${aspectRatio};`}
      >
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

  #renderVisual(value: OEmbedResponseModel) {
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

    return html`${this.#renderVisual(value)}`;
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

      .oembed-link-card {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-4);
        padding: var(--uui-size-space-4);
        border-radius: var(--uui-border-radius, 3px);
        background-color: var(--uui-color-surface-alt, #f3f3f5);
        overflow: hidden;
      }

      .oembed-link-card uui-icon {
        flex: none;
        font-size: var(--uui-size-6);
        color: var(--uui-color-text-alt);
      }

      .oembed-link-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .oembed-link-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .oembed-link-host {
        font-size: var(--uui-type-small-size);
        color: var(--uui-color-text-alt);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
