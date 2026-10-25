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
