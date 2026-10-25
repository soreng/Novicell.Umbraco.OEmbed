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

| Project                            | Description                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Novicell.Umbraco.OEmbed.Core`             | Core implementation: the oEmbed service, endpoint/discovery providers, options, property editor and constants. |
| `Novicell.Umbraco.OEmbed.Web`              | Management API controllers and models for the backoffice.                                                      |
| `Novicell.Umbraco.OEmbed.Web.StaticAssets` | Backoffice front-end (TypeScript/Lit) bundled with Vite.                                                       |
| `Novicell.Umbraco.OEmbed.Startup`          | Composition root: the `IComposer` and builder extensions that wire everything up.                              |
| `Novicell.Umbraco.OEmbed`                  | Meta NuGet package that ties the other projects together.                                                      |
| `demo/OEmbed.Testsite`             | A runnable Umbraco site used for local development and testing.                                                |

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

## Running the demo site

```bash
dotnet run --project demo/OEmbed.Testsite/OEmbed.Testsite.csproj
```

To work on the backoffice UI, build the client assets in `src/Novicell.Umbraco.OEmbed.Web.StaticAssets/Client`:

```bash
npm install
npm run build
```

## Requirements

- .NET 10 SDK
- Umbraco CMS

## License

Copyright © Novicell.
