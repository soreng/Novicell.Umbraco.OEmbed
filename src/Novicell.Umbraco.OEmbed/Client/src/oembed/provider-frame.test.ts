import { expect } from "chai";
import { effectiveSandbox, parseProviderFrame } from "./provider-frame.ts";

const origin = "https://backoffice.example";

describe("effectiveSandbox", () => {
  const policy = ["allow-scripts", "allow-same-origin", "allow-popups"];

  it("uses the package policy when the provider asked for no sandbox", () => {
    expect(effectiveSandbox(undefined, policy)).to.equal(
      "allow-scripts allow-same-origin allow-popups",
    );
  });

  it("never grants more than the provider asked for", () => {
    expect(effectiveSandbox("allow-scripts", policy)).to.equal("allow-scripts");
    expect(effectiveSandbox("allow-scripts allow-forms", policy)).to.equal("allow-scripts");
  });

  it("keeps an empty sandbox fully restricted", () => {
    expect(effectiveSandbox("", policy)).to.equal("");
  });

  it("splits tokens only on ASCII whitespace, like the browser does", () => {
    // A non-breaking space does not separate tokens, so the browser sees one unknown token.
    expect(effectiveSandbox("allow-scripts allow-popups", policy)).to.equal("");
    expect(effectiveSandbox("allow-scripts allow-popups", policy)).to.equal("");
    // Tab, newline, form feed and carriage return do separate tokens.
    expect(effectiveSandbox("allow-scripts\tallow-popups\n\f\r", policy)).to.equal(
      "allow-scripts allow-popups",
    );
  });

  it("ignores casing and extra whitespace in the provider's tokens", () => {
    expect(effectiveSandbox("  ALLOW-POPUPS   allow-scripts ", policy)).to.equal(
      "allow-scripts allow-popups",
    );
  });
});

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
      sandbox: undefined,
      referrerPolicy: undefined,
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

  it("rejects an iframe that also has a srcdoc, which browsers load instead of src", () => {
    expect(
      parseProviderFrame(
        '<iframe src="https://player.example/x" srcdoc="<p>other</p>"></iframe>',
        origin,
      ),
    ).to.be.undefined;
  });

  it("reads the sandbox the provider asked for, including an empty one", () => {
    const none = parseProviderFrame('<iframe src="https://player.example/x"></iframe>', origin);
    const some = parseProviderFrame(
      '<iframe src="https://player.example/x" sandbox="allow-scripts allow-forms"></iframe>',
      origin,
    );
    const empty = parseProviderFrame(
      '<iframe src="https://player.example/x" sandbox></iframe>',
      origin,
    );

    expect(none?.sandbox).to.be.undefined;
    expect(some?.sandbox).to.equal("allow-scripts allow-forms");
    expect(empty?.sandbox).to.equal("");
  });

  it("passes on a referrer policy only when it does not leak the full backoffice URL", () => {
    const policy = (value: string) =>
      parseProviderFrame(
        `<iframe src="https://player.example/x" referrerpolicy="${value}"></iframe>`,
        origin,
      )?.referrerPolicy;

    expect(policy("strict-origin-when-cross-origin")).to.equal("strict-origin-when-cross-origin");
    expect(policy("no-referrer")).to.equal("no-referrer");
    expect(policy("unsafe-url")).to.be.undefined;
    expect(policy("no-referrer-when-downgrade")).to.be.undefined;
    expect(policy("nonsense")).to.be.undefined;
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
