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

  it("renders a sandboxed iframe with the embed markup for a video type", async () => {
    element.value = {
      type: "video" as any,
      html: '<iframe src="https://example.com/embed"></iframe>',
      width: 16,
      height: 9,
    };
    await element.updateComplete;

    const iframe = element.shadowRoot!.querySelector(
      "iframe.oembed-media",
    ) as HTMLIFrameElement;
    expect(iframe).to.not.be.null;
    expect(iframe.getAttribute("sandbox")).to.equal(
      "allow-scripts allow-same-origin allow-presentation",
    );
    expect(iframe.getAttribute("srcdoc")).to.contain(
      "https://example.com/embed",
    );
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
});
