# Novicell.Umbraco.OEmbed

An [oEmbed](https://oembed.com/) integration for [Umbraco CMS](https://umbraco.com/). It lets editors paste a URL (YouTube, Vimeo, Twitter/X, etc.) and have Umbraco resolve the rich embed (HTML, thumbnail, dimensions and metadata) through the oEmbed protocol.

Built on .NET 10 and Umbraco's built-in embed provider infrastructure.

## Features

- **OEmbed property editor** (`Novicell.OEmbed.Picker`) for storing embeds on documents, media and blocks.
- **OEmbed resolution service** (`IOEmbedService`) that turns a URL into a strongly-typed oEmbed response.
- **Provider matching** via Umbraco's `EmbedProvidersCollection`, with optional **auto-discovery** for providers that advertise an oEmbed endpoint via `<link>` tags.
- **Management API endpoint** for the backoffice to request embeds.
- **Backoffice UI** delivered as static assets (Lit + Vite + TypeScript).
- Handles both **JSON** and **XML** oEmbed responses.

## Project structure

| Path                                      | Description                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/Novicell.Umbraco.OEmbed`             | The NuGet package: oEmbed service, endpoint/discovery providers, property editor, Management API, composer and the `Client/` backoffice UI (TypeScript/Lit, built with Vite). |
| `tests/Novicell.Umbraco.OEmbed.Tests`     | NUnit tests for the service, validators and value converter.                                                                          |
| `demo/OEmbed.Testsite`                    | A runnable Umbraco site used for local development and testing.                                                                       |

Inside the package, namespaces mirror folders: `Api`, `Composers`, `Configuration`, `EmbedProviders`, `Models`, `PropertyEditors` and `Services`. See [src/CLAUDE.md](src/CLAUDE.md) and [Client/ARCHITECTURE.md](src/Novicell.Umbraco.OEmbed/Client/ARCHITECTURE.md) for details.

## How it works

1. A URL is submitted (from the backoffice or via `IOEmbedService.GetOEmbedAsync`).
2. `OEmbedApiEndpointProvider` matches the URL against the registered `EmbedProvidersCollection` to find a provider's oEmbed API endpoint.
3. If no provider matches and auto-discovery is enabled, `OEmbedApiEndpointDiscoveryProvider` inspects the target page for an advertised oEmbed endpoint.
4. The endpoint is called and the JSON/XML response is parsed into an `OEmbedResponse`.
5. The result is returned as an `Attempt<OEmbedResponse?, OEmbedOperationStatus>`, surfacing clear status outcomes (e.g. `ProviderNotSupported`, `EmbedNotFound`, `InvalidResponse`).

## Getting started

### Register the package

Registration happens automatically via `OEmbedComposer`. If you need to register it manually, call the builder extension from your composer or `Program.cs`:

```csharp
builder.AddNovicellOEmbed();
```

### Configuration

Configure options under the `Novicell:OEmbed` section in `appsettings.json`:

```json
{
    "Novicell": {
        "OEmbed": {
            "Autodiscover": true
        }
    }
}
```

| Setting        | Default | Description                                                                                                             |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Autodiscover` | `false` | When enabled, attempts to discover an oEmbed endpoint from the target page when no registered provider matches the URL. |
| `AllowPrivateNetworks` | `false` | Allows the server to call loopback and private network addresses. Off by default, see the security note below. |

### Security note on providers and Autodiscover

The live preview in the picker modal shows the HTML that an oEmbed provider has just returned to the server. A provider that returns a single `<iframe>` (YouTube, Vimeo, Spotify and similar) is rendered as a normal cross-origin iframe. Other markup, typically a `<blockquote>` plus the provider's script (X, TikTok, Reddit), runs in a sandboxed iframe that shares the backoffice's origin, because those scripts need it to work. The providers registered with Umbraco, plus Reddit, Spotify and TikTok added by this package, are therefore trusted.

Enabling `Autodiscover` extends that trust to any site an editor pastes, and makes the server request the URLs it finds. Leave it off unless you trust the editors with that.

Whatever the server requests on an editor's behalf is limited: only `http` and `https`, a 10 second limit for the whole request including reading the body, at most 3 redirects and a 1 MiB response. The server also only connects to publicly routable addresses. Loopback, private (RFC 1918), link-local (including cloud metadata at `169.254.169.254`), carrier-grade NAT, multicast and reserved ranges are refused, and the check is made on the address actually connected to, so redirects and DNS rebinding cannot get around it.

Set `AllowPrivateNetworks` to `true` if you need to call a provider on `localhost`, or if the server can only reach the internet through an outbound proxy. With the setting off, the server connects directly and ignores proxy settings, because a proxy would hide the real destination from the address check. With it on, no address check is made and the normal proxy settings apply, so the proxy has to restrict what can be reached. The setting is read when the HTTP client is created, so changing it needs a restart.

A saved value is different: the stored `oembed` JSON, including its `html`, is sent by the client and is not checked against the provider. The property editor therefore never runs it. Saved embeds are shown as a thumbnail or link card, and only the picker modal fetches a fresh response and runs it. The server rejects a saved value that has a URL other than http(s), and the published value converter removes any such URL from what a site receives (and leaves out an item whose own URL is not http(s)), so values written by uSync, a database change or an older version are covered too. Neither verifies the `html`. Sites that render the stored `html` on the frontend should treat it as editor-supplied content.

## Running the demo site

```bash
dotnet run --project demo/OEmbed.Testsite/OEmbed.Testsite.csproj
```

The backoffice client is built into `wwwroot/App_Plugins/NovicellUmbracoOEmbed` and is not committed, so build it before running the demo (and before `dotnet pack`):

```bash
cd src/Novicell.Umbraco.OEmbed/Client
npm ci
npm run build
```

## Requirements

- .NET 10 SDK
- Umbraco CMS

## License

Copyright © Novicell.
