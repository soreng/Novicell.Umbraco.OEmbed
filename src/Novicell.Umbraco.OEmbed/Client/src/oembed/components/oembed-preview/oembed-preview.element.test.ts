import { expect } from "chai";
import "./oembed-preview.element.ts";
import type { OEmbedPreviewElement } from "./oembed-preview.element.ts";

/**
 * Tests for OEmbedPreviewElement.
 * Verifies it renders the correct markup per oEmbed type and normalizes casing.
 */
describe("OEmbedPreviewElement", () => {
  let element: OEmbedPreviewElement;

  beforeEach(() => {
    element = document.createElement(
      "oembed-preview",
    ) as OEmbedPreviewElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it("renders nothing when no value is set", async () => {
    await element.updateComplete;
    expect(element.shadowRoot!.querySelector(".oembed-frame")).to.be.null;
  });

  it("renders an <img> for a photo type", async () => {
    element.value = {
      type: "photo" as any,
      url: "https://example.com/photo.jpg",
      width: 800,
      height: 600,
    };
    await element.updateComplete;

    const img = element.shadowRoot!.querySelector("img.oembed-media");
    expect(img).to.not.be.null;
    expect(img!.getAttribute("src")).to.equal(
      "https://example.com/photo.jpg",
    );
  });

  it("falls back to the thumbnail card for a photo with no url", async () => {
    element.value = {
      type: "photo" as any,
      thumbnailUrl: "https://example.com/thumb.jpg",
      thumbnailWidth: 200,
      thumbnailHeight: 100,
    };
    await element.updateComplete;

    const img = element.shadowRoot!.querySelector("img.oembed-media");
    expect(img!.getAttribute("src")).to.equal(
      "https://example.com/thumb.jpg",
    );
  });

  it("renders the thumbnail card for a link type", async () => {
    element.value = {
      type: "link" as any,
      thumbnailUrl: "https://example.com/thumb.jpg",
      thumbnailWidth: 200,
      thumbnailHeight: 100,
    };
    await element.updateComplete;

    const img = element.shadowRoot!.querySelector("img.oembed-media");
    expect(img).to.not.be.null;
  });

  it("renders a provider's lone iframe directly, sandboxed, with its own origin", async () => {
    element.value = {
      type: "video" as any,
      html: '<iframe src="https://example.com/embed" allow="autoplay" allowfullscreen title="Clip"></iframe>',
      width: 16,
      height: 9,
    };
    await element.updateComplete;

    const iframe = element.shadowRoot!.querySelector(
      "iframe.oembed-media",
    ) as HTMLIFrameElement;
    expect(iframe).to.not.be.null;
    expect(iframe.getAttribute("src")).to.equal("https://example.com/embed");
    expect(iframe.hasAttribute("srcdoc")).to.be.false;
    expect(iframe.getAttribute("sandbox")).to.contain("allow-scripts");
    expect(iframe.getAttribute("sandbox")).to.contain("allow-same-origin");
    expect(iframe.getAttribute("allow")).to.equal("autoplay");
    expect(iframe.hasAttribute("allowfullscreen")).to.be.true;
    expect(iframe.getAttribute("title")).to.equal("Clip");
  });

  it("renders other markup in a sandboxed srcdoc iframe", async () => {
    element.value = {
      type: "video" as any,
      html: '<blockquote class="embed">x</blockquote><script async src="https://example.com/widgets.js"></script>',
      width: 16,
      height: 9,
    };
    await element.updateComplete;

    const iframe = element.shadowRoot!.querySelector(
      "iframe.oembed-media",
    ) as HTMLIFrameElement;
    expect(iframe.getAttribute("sandbox")).to.equal(
      "allow-scripts allow-same-origin allow-presentation",
    );
    expect(iframe.getAttribute("srcdoc")).to.contain("widgets.js");
    expect(iframe.hasAttribute("src")).to.be.false;
  });

  it("does not render an iframe that points back at the backoffice directly", async () => {
    element.value = {
      type: "video" as any,
      html: `<iframe src="${window.location.origin}/some/page"></iframe>`,
      width: 16,
      height: 9,
    };
    await element.updateComplete;

    const iframe = element.shadowRoot!.querySelector(
      "iframe.oembed-media",
    ) as HTMLIFrameElement;
    expect(iframe.hasAttribute("src")).to.be.false;
    expect(iframe.hasAttribute("srcdoc")).to.be.true;
  });

  it("sizes a dimensionless provider iframe from its own height attribute, capped", async () => {
    element.value = {
      type: "rich" as any,
      html: '<iframe src="https://example.com/embed" height="400"></iframe>',
    };
    await element.updateComplete;
    const frame = () =>
      element.shadowRoot!.querySelector("iframe") as HTMLIFrameElement;
    expect(frame().style.height).to.equal("400px");

    element.value = {
      type: "rich" as any,
      html: '<iframe src="https://example.com/embed" height="5000"></iframe>',
    };
    await element.updateComplete;
    expect(frame().style.height).to.equal("600px");
  });

  it("normalizes mixed-case types from the Management API (e.g. 'Photo')", async () => {
    element.value = {
      type: "Photo" as any,
      url: "https://example.com/photo.jpg",
    };
    await element.updateComplete;

    expect(element.shadowRoot!.querySelector("img.oembed-media")).to.not.be
      .null;
  });

  it("falls back to the thumbnail card when a rich/video type has no html", async () => {
    element.value = {
      type: "rich" as any,
      thumbnailUrl: "https://example.com/thumb.jpg",
    };
    await element.updateComplete;

    expect(element.shadowRoot!.querySelector("iframe")).to.be.null;
    expect(element.shadowRoot!.querySelector("img.oembed-media")).to.not.be
      .null;
  });

  describe("untrusted provider markup", () => {
    afterEach(() => {
      delete (window as any).__oembedXss;
    });

    it("does not run event handlers from the markup in the backoffice document", async () => {
      element.value = {
        type: "video" as any,
        html: '<img src="x-does-not-exist.png" onerror="window.__oembedXss = true">',
        width: 16,
        height: 9,
      };
      await element.updateComplete;
      // The failed image load fires asynchronously.
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect((window as any).__oembedXss).to.be.undefined;
    });

    it("still passes the markup to the iframe unchanged", async () => {
      element.value = {
        type: "video" as any,
        html: '<img src="x-does-not-exist.png" onerror="window.__oembedXss = true">',
        width: 16,
        height: 9,
      };
      await element.updateComplete;

      const srcdoc = element
        .shadowRoot!.querySelector("iframe")!
        .getAttribute("srcdoc");
      expect(srcdoc).to.contain('onerror="window.__oembedXss = true"');
    });
  });
});
