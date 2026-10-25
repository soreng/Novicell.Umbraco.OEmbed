import { expect } from "chai";
import { parseProviderFrame } from "./provider-frame.ts";

const origin = "https://backoffice.example";

/**
 * A provider's markup is rendered as a direct iframe only when it is exactly one iframe on
 * another origin. Everything else must stay inside the opaque-origin sandbox.
 */
describe("parseProviderFrame", () => {
  it("reads a YouTube-style iframe", () => {
    const frame = parseProviderFrame(
      '<iframe width="200" height="113" src="https://www.youtube.com/embed/abc?feature=oembed" title="A video" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
      origin,
    );

    expect(frame).to.deep.equal({
      src: "https://www.youtube.com/embed/abc?feature=oembed",
      allow: "autoplay; encrypted-media",
      allowFullscreen: true,
      title: "A video",
      width: 200,
      height: 113,
    });
  });

  it("ignores surrounding whitespace and comments", () => {
    const frame = parseProviderFrame(
      '\n  <!-- embed -->\n<iframe src="https://player.example/x"></iframe>\n',
      origin,
    );

    expect(frame?.src).to.equal("https://player.example/x");
    expect(frame?.allowFullscreen).to.be.false;
  });

  it("returns undefined for markup that is not a lone iframe", () => {
    const rejected = [
      '<blockquote class="tiktok-embed">text</blockquote><script async src="https://example.com/embed.js"></script>',
      '<iframe src="https://player.example/x"></iframe><p>caption</p>',
      '<iframe src="https://player.example/a"></iframe><iframe src="https://player.example/b"></iframe>',
      '<div><iframe src="https://player.example/x"></iframe></div>',
      '<img src="x">',
      "plain text",
      "",
    ];

    for (const markup of rejected) {
      expect(parseProviderFrame(markup, origin), markup).to.be.undefined;
    }
  });

  it("rejects an iframe preceded by a script, style or link element", () => {
    expect(
      parseProviderFrame(
        '<script src="https://evil.example/x.js"></script><iframe src="https://player.example/x"></iframe>',
        origin,
      ),
    ).to.be.undefined;
    expect(
      parseProviderFrame(
        '<style>body{}</style><iframe src="https://player.example/x"></iframe>',
        origin,
      ),
    ).to.be.undefined;
  });

  it("rejects an iframe whose src is not an absolute http(s) URL", () => {
    for (const src of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "about:blank",
      "//player.example/x",
      "/relative/path",
      "",
    ]) {
      expect(
        parseProviderFrame(`<iframe src="${src}"></iframe>`, origin),
        src,
      ).to.be.undefined;
    }
    expect(parseProviderFrame("<iframe></iframe>", origin)).to.be.undefined;
  });

  it("rejects an iframe that points at the backoffice origin", () => {
    expect(
      parseProviderFrame(`<iframe src="${origin}/umbraco/x"></iframe>`, origin),
    ).to.be.undefined;
  });

  it("does not run or load anything while parsing", () => {
    (window as any).__providerFrameRan = false;
    parseProviderFrame(
      '<img src="x-does-not-exist.png" onerror="window.__providerFrameRan = true"><iframe src="https://player.example/x"></iframe>',
      origin,
    );

    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect((window as any).__providerFrameRan).to.be.false;
        delete (window as any).__providerFrameRan;
        resolve();
      }, 300),
    );
  });
});
