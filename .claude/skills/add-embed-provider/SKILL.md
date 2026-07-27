---
name: add-embed-provider
description: Add a new oEmbed provider (e.g. TikTok, Spotify, Reddit) to Novicell.OEmbed. Use when a paste-a-URL provider is reported as "not supported" and the platform has a public oEmbed endpoint.
---

# Adding an embed provider to Novicell.OEmbed

This project resolves oEmbed URLs by matching them against Umbraco CMS's own
`EmbedProvidersCollection` (see `OEmbedApiEndpointProvider.cs`). If a platform
isn't in that collection, pasting its URL fails with `ProviderNotSupported`
— even though the platform may have a perfectly good public oEmbed endpoint.
Adding a provider class fixes this without relying on the `Autodiscover`
fallback (which is slower, network-dependent, and only works when the target
page actually advertises an oEmbed discovery link).

## 1. Confirm the platform actually has a public oEmbed endpoint

Don't guess. Check both:

- **oEmbed provider directory**: https://oembed.com/providers.json — the
  canonical list of registered providers. Download it and grep rather than
  relying on a summarized fetch (it's large and gets truncated/truncated
  results are unreliable):

  ```bash
  curl -s https://oembed.com/providers.json -o /tmp/providers.json
  grep -n '"provider_name": "TargetPlatform"' /tmp/providers.json
  sed -n '<line-1>,<line+20>p' /tmp/providers.json
  ```

  Note the entry's `endpoints[].url` (the oEmbed API endpoint) and
  `endpoints[].schemes` (the URL patterns it handles).

- **Umbraco's own docs**: https://docs.umbraco.com/umbraco-cms/extend-your-project/server-side-extensions/embedded-media-providers
  — lists what Umbraco core already ships (YouTube, YouTube Shorts, X/Twitter,
  Vimeo, Dailymotion, Flickr, SlideShare, Kickstarter, Getty Images, Ted,
  SoundCloud, Issuu, Hulu, Giphy, LottieFiles as of writing). No need to
  re-implement any of these — check this list before adding a new class.

If the platform has **no entry** in `providers.json`, it likely has no public
oEmbed API at all (e.g. Twitch, Imgur — confirmed absent, not just
undocumented). In that case, adding a provider class is not the right fix;
say so rather than inventing a scheme.

## 2. Verify the endpoint actually behaves as documented

`providers.json` describes the spec, not always the current reality. Before
writing code, hit the endpoint directly (WebFetch or `curl`) with a real
public URL for that platform and check:

- Does it return JSON by default, or does it require an explicit
  `format=json` query param? (Most default to JSON. CodePen was found to need
  `format=json` explicitly — but even that couldn't be fully confirmed by
  server-side/non-browser requests, see the bot-protection note below.)
- Does it 404/401/403 for reasons unrelated to the provider itself? Some
  platforms (CodePen confirmed) sit behind bot protection (e.g. Cloudflare)
  that rejects non-browser `User-Agent`/header profiles with 401 or 403 even
  though the endpoint works fine from an actual browser. If a request that
  works in-browser fails identically from every non-browser tool you try
  (WebFetch, curl), that's a signal the platform is not fixable via a normal
  server-side provider — flag it as a known limitation instead of chasing it
  further (this is why CodePen was removed after being added).

## 3. Implement the provider

This project's `OEmbedService` (`Novicell.OEmbed.Core/OEmbed/OEmbedService.cs`)
does its own JSON/XML fetching and parsing — it does **not** call
`IEmbedProvider.GetMarkupAsync`. Only three members actually matter for URL
matching and endpoint construction: `ApiEndpoint`, `UrlSchemeRegex`,
`RequestParams` (see `OEmbedApiEndpointProvider.cs`). Still implement
`GetMarkupAsync` properly — the class is registered into Umbraco's shared
`EmbedProvidersCollection`, which other Umbraco features (e.g. the Rich Text
Editor's embed insert) may call directly.

Create the class under
`src/Novicell.OEmbed.Core/OEmbed/EmbedProviders/<ProviderName>.cs`, following
the same shape as Umbraco core's own providers
(`Umbraco.Cms.Core.Media.EmbedProviders.OEmbedProviderBase` — see e.g.
`Kickstarter.cs`, `SoundCloud.cs`, `Flickr.cs` in the Umbraco-CMS repo for
reference patterns):

```csharp
using Umbraco.Cms.Core.Media.EmbedProviders;
using Umbraco.Cms.Core.Serialization;

namespace Novicell.OEmbed.Core.OEmbed.EmbedProviders;

public class Spotify : OEmbedProviderBase
{
    public Spotify(IJsonSerializer jsonSerializer)
        : base(jsonSerializer)
    {
    }

    /// <inheritdoc/>
    public override string ApiEndpoint => "https://open.spotify.com/oembed";

    /// <inheritdoc/>
    public override string[] UrlSchemeRegex =>
    [
        @"^https?:\/\/open\.spotify\.com\/",
        @"^https?:\/\/spotify\.link\/",
    ];

    /// <inheritdoc/>
    public override Dictionary<string, string> RequestParams => [];

    /// <inheritdoc/>
    public override async Task<string?> GetMarkupAsync(string url, int? maxWidth, int? maxHeight, CancellationToken cancellationToken)
        => await GetJsonBasedMarkupAsync(url, maxWidth, maxHeight, cancellationToken);
}
```

Notes:
- Translate each `providers.json` scheme glob (e.g. `https://open.spotify.com/*`)
  into an anchored regex for `UrlSchemeRegex` — one array entry per scheme.
- Use `GetJsonBasedMarkupAsync` for JSON providers, `GetXmlBasedMarkupAsync`
  for XML ones (check the `formats` field in the `providers.json` entry; if
  absent, JSON is the spec default).
- Only add to `RequestParams` if you've confirmed via step 2 that the param
  is actually required — don't cargo-cult `format=json` onto every provider.

## 4. Register the provider

In `src/Novicell.OEmbed.Core/Configuration/UmbracoBuilderExtensions.cs`,
append it to the `EmbedProviders()` collection builder inside
`AddNovicellOEmbedCore`:

```csharp
builder.EmbedProviders()
    .Append<Reddit>()
    .Append<Spotify>()
    .Append<TikTok>();
```

This is the standard Umbraco composition pattern
(`builder.EmbedProviders().Append<T>()`), documented at
https://docs.umbraco.com/umbraco-cms/extend-your-project/server-side-extensions/embedded-media-providers.
No separate `IComposer` class is needed here since this project already has
its own `AddNovicellOEmbedCore` builder extension as the composition root.

## 5. Verify

- `dotnet build src/Novicell.OEmbed.Core/Novicell.OEmbed.Core.csproj`
- Test a real, live URL for the platform end-to-end in the demo site
  (`demo/OEmbed.Testsite`) — paste it into the oEmbed picker and confirm it
  resolves with the expected `type` (photo/video/link/rich).

## 6. If it doesn't work

Don't reach for `Autodiscover: true` as a workaround — that was tried for
TikTok and reverted once a proper provider was added, per explicit direction
to not rely on autodiscovery. If a platform's endpoint fails from the server
but works in-browser, it's very likely bot protection (see step 2) rather
than a bug in the provider class — confirm with a fresh live URL and a direct
fetch before concluding the class itself is wrong.
