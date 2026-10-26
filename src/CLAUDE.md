# Novicell.Umbraco.OEmbed – Backend Architecture

.NET backend extension for Umbraco CMS providing oEmbed protocol integration. Enables editors to embed external content (videos, images, rich embeds) by pasting URLs.

---

## 1. Project Structure

One Razor class library, `src/Novicell.Umbraco.OEmbed`, shipped as the NuGet package `Novicell.Umbraco.OEmbed`. The layout follows `Novicell.Umbraco.Typography`: namespaces mirror folders and the backoffice client lives in `Client/`.

```
src/Novicell.Umbraco.OEmbed/
├── Api/
│   ├── Controllers/       OEmbedApiController, OEmbedApiControllerBase
│   ├── Models/            OEmbedResponseModel (API-shape DTO)
│   └── Configuration/     OEmbedApiOperationIdHandler, OEmbedApiOperationSecurityFilter
├── Composers/             OEmbedComposer
├── Configuration/         UmbracoBuilderExtensions (AddNovicellOEmbed)
├── EmbedProviders/        Reddit, Spotify, TikTok (added to Umbraco's EmbedProvidersCollection)
├── Models/                OEmbedResponse, OEmbedPropertyValue, OEmbedRequest, OEmbedType, OEmbedOptions, ...
├── PropertyEditors/       OEmbedDataEditor, OEmbedDataValueEditor, validators, value converter
├── Services/              IOEmbedService, OEmbedService, endpoint and discovery providers, OEmbedOperationStatus
├── Client/                Lit/TypeScript backoffice UI (Vite), see Client/ARCHITECTURE.md
└── wwwroot/App_Plugins/NovicellUmbracoOEmbed/   build output of Client/, git-ignored
```

**Key types**:

- `IOEmbedService` / `OEmbedService` – Resolves URLs to oEmbed metadata (JSON/XML handling, auto-discovery)
- `OEmbedApiEndpointProvider` – matches a URL against Umbraco's registered `EmbedProvidersCollection`
- `OEmbedApiEndpointDiscoveryProvider` – auto-discovery via HTTP `Link` header or `<link rel="alternate"|"alternative" type="application/json+oembed">` in the page HTML
- `OEmbedOptions` – configuration (`Autodiscover`)
- `OEmbedDataEditor` / `OEmbedDataValueEditor` / `OEmbedMinMaxValidator` / `OEmbedAllowedTypeValidator` / `OEmbedUrlValidator` – property editor definition and validation (the last one rejects non-http(s) URLs in a saved value)
- `OEmbedPropertyValueConverter` – converts the stored property JSON into a strongly-typed `OEmbedPropertyValue` for Razor views
- `OEmbedApiController` – `GET {ApiName}/api/v{version}/oembed?url=&maxwidth=&maxheight=`; `OEmbedApiControllerBase` maps `OEmbedOperationStatus` to problem-details responses
- `UmbracoBuilderExtensions.AddNovicellOEmbed()` – the single entry point, called by `OEmbedComposer`

**DI pattern**: all services are registered as `Transient`.

**Outbound HTTP**: all calls go through the named client `OEmbedHttp.ClientName` (`AddOEmbedHttpClient`): http(s) only, 10 second timeout, 3 redirects, 1 MiB responses (`OEmbedHttp`). Unless `AllowPrivateNetworks` is set, `PublicNetworkConnector` connects only to public addresses (`IpAddressClassifier`).

**Frontend**: the Vite build writes to `wwwroot/App_Plugins/NovicellUmbracoOEmbed` and `StaticWebAssetBasePath` is `/`, so the files are served from `/App_Plugins/NovicellUmbracoOEmbed/`. The client must be built (`npm ci && npm run build` in `Client/`) before `dotnet build` or `dotnet pack`.

See [Novicell.Umbraco.OEmbed/Client/ARCHITECTURE.md](./Novicell.Umbraco.OEmbed/Client/ARCHITECTURE.md) for frontend patterns.

**Rule**: there is a single project on purpose. Split out a separate project (for example a Core package) only when a second, architecturally distinct consumer needs the same types.

---

## 2. Service Architecture

### IOEmbedService

```csharp
public interface IOEmbedService
{
    Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> GetOEmbedAsync(
        OEmbedRequest request,
        CancellationToken cancellationToken
    );
}
```

**Implementation** (`OEmbedService`):

- Fetches oEmbed metadata from external providers
- Supports JSON (Newtonsoft, error-tolerant) and XML responses
- XML parsing is XXE-hardened (`XmlReaderSettings` with `DtdProcessing.Prohibit`, `XmlResolver = null`)
- Auto-discovers providers via `OEmbedApiEndpointDiscoveryProvider` when no static provider matches and `Autodiscover` is enabled
- Returns `Attempt<OEmbedResponse?, OEmbedOperationStatus>` – never throws, always returns a typed status

**Operation Status** (`OEmbedOperationStatus`):

```csharp
public enum OEmbedOperationStatus
{
    Success,
    ProviderNotSupported,
    EmbedNotFound,
    InvalidResponse
}
```

`InvalidResponse` covers all fetch/parse failures, including network errors and timeouts – a distinct `NetworkError` status was considered and deliberately not added, since the Management API returns a generic problem-details response for every failure status regardless.

### Endpoint Provider Pattern

Two complementary providers:

1. **`IOEmbedApiEndpointProvider`** – matches the URL against Umbraco's own `EmbedProvidersCollection` (YouTube, Vimeo, etc., as registered by Umbraco core) via each provider's `UrlSchemeRegex`. Fast, no network calls.
2. **`IOEmbedApiEndpointDiscoveryProvider`** – dynamic discovery. Checks the target URL's HTTP `Link` header first, then falls back to parsing `<link rel="alternate"|"alternative">` in the page HTML. Slower but supports any provider advertising oEmbed. Controlled by `OEmbedOptions.Autodiscover`.

### Property Value Converter

`OEmbedPropertyValueConverter` converts the property editor's stored JSON (an array of `{ "url": "...", "oembed": { ... } }`, or the legacy single-object shape) into `OEmbedPropertyValue` records, so the value is usable from Razor views rather than being exposed as a raw JSON string. Like Umbraco's media picker, the Razor value is a single `OEmbedPropertyValue?` (the first item, or null) when the data type's `Multiple` setting is off, and an `IEnumerable<OEmbedPropertyValue>` when it is on; the Delivery API is an array either way. It also implements `IDeliveryApiPropertyValueConverter`: for the Delivery API the value is an array of `ApiOEmbed` (`DeliveryApi/ApiOEmbed.cs`), a contract of its own with explicit camelCase names, so renaming the Razor model cannot change what a headless site receives. The JSON is pinned by `OEmbedDeliveryApiTests`. The stored `oembed` object uses the names of the oEmbed specification (`author_name`, `thumbnail_url`, ...) so that it is as close as possible to what the provider returned, while the backoffice and the Management API use camelCase (`authorName`, `thumbnailUrl`, ...). `OEmbedDataValueEditor` converts between the two (`FromEditor` on save, `ToEditor` on load) using the table in `OEmbedJsonNames`, and wraps the validators so they see the stored names: they deserialize into `OEmbedResponse`, whose `JsonPropertyName` attributes match the stored names (Umbraco's serializer does not use `DataMember`). The Umbraco 9 version wrote the same names as one object instead of an array, and pre-release builds of this version wrote camelCase; `OEmbedPropertyValueJson` reads all of these, using the same table. The converter also applies the URL rule (`OEmbedUrlSafety`) to what it returns: a URL that is not http(s), or has a control character, is removed, and an unusable item is left out, because the save validator is not the only way a value reaches the database and parses the JSON differently (case-sensitively) from the converter.

---

## 3. DI Registration Pattern

**Entry point**: `Configuration/UmbracoBuilderExtensions.cs`

```csharp
public static IUmbracoBuilder AddNovicellOEmbed(this IUmbracoBuilder builder)
{
    builder.AddNovicellOEmbedCore();
    builder.AddNovicellOEmbedWeb();
    return builder;
}
```

**Core registration** (private `AddNovicellOEmbedCore`): endpoint provider, discovery provider and service as `Transient`, `OEmbedOptions` bound to `Novicell:OEmbed`, the property value converter, and the Reddit, Spotify and TikTok embed providers.

**Web registration** (`AddNovicellOEmbedWeb`): registers the versioned Management API (Swagger doc, operation-id handler, security filter) via `WithNovicellOEmbedManagementApi()`. There is no notification handler in this project.

---

## 4. Configuration

**appsettings.json**:

```json
{
    "Novicell": {
        "OEmbed": {
            "Autodiscover": false
        }
    }
}
```

**Options class** (`Models/OEmbedOptions.cs`):

```csharp
public class OEmbedOptions
{
    public bool Autodiscover { get; set; } = false;
}
```

Accessed via `IOptions<OEmbedOptions>` in services.

---

## 5. Adding Features

### Add a New Service Method

1. **Interface**: define the method signature on `IOEmbedService`
2. **Implementation**: add the logic to `OEmbedService`
3. **Usage**: inject `IOEmbedService` in controllers, or call it from the client through the API

### Add a New API Endpoint

1. **Controller** in `Api/Controllers`: inherit from `OEmbedApiControllerBase`
2. **Request/Response models**: add to `Api/Models`
3. **Register**: wired up via `AddNovicellOEmbedWeb()` / `WithNovicellOEmbedManagementApi()`; regenerate the client with `npm run generate-client`

### Add a New Embed Provider

Use the `add-embed-provider` skill (`.claude/skills/add-embed-provider`).

### Add a New Property Editor

1. **Editor definition** in `PropertyEditors`: `OEmbedDataEditor` (or a new one)
2. **Manifest** in `Client/src`
3. **Lit components** in `Client/src`

---

## 6. Testing Considerations

### Backend Tests (`tests/Novicell.Umbraco.OEmbed.Tests`)

- Cover `OEmbedService` (provider matching/fallthrough, HTTP status mapping, JSON/XML parsing, XXE-hardening regression), `OEmbedPropertyValueConverter`, `OEmbedMinMaxValidator` and `OEmbedAllowedTypeValidator`
- Approach: mock `HttpMessageHandler` responses via `IHttpClientFactory`, assert typed `OEmbedOperationStatus` outcomes
- Internal types are reachable through `InternalsVisibleTo`

### Frontend Tests

- Scope: components, repositories, data sources (`@web/test-runner` + MSW mocking)
- Run with `npm test` in `Client/`

---

## 7. Extending the Extension

### Custom Providers

Implement `IOEmbedApiEndpointProvider` to add proprietary provider matching.

### Custom Property Editors

Create new property editors that use `IOEmbedService`.

### Frontend Customization

Override components in `Client/src/oembed/` or `property-editors/`, or create new extension types.

---

## 8. Key Files Reference

| File                                                         | Purpose                     |
| ------------------------------------------------------------ | --------------------------- |
| `Novicell.Umbraco.OEmbed/Configuration/UmbracoBuilderExtensions.cs` | DI entry point              |
| `Novicell.Umbraco.OEmbed/Composers/OEmbedComposer.cs`        | Umbraco composer            |
| `Novicell.Umbraco.OEmbed/Services/OEmbedService.cs`          | Core service implementation |
| `Novicell.Umbraco.OEmbed/PropertyEditors/OEmbedPropertyValueConverter.cs` | Property value converter    |
| `Novicell.Umbraco.OEmbed/Api/Controllers/OEmbedApiController.cs` | REST endpoint               |
| `Novicell.Umbraco.OEmbed/Client/src/oembed/`                 | Frontend components & logic |
| `Novicell.Umbraco.OEmbed/Client/public/umbraco-package.json` | Extension manifest          |

---

## 9. Umbraco Patterns Used

- **DI Composition**: Umbraco's `IUmbracoBuilder` pattern
- **Result Pattern**: `Attempt<T, TStatus>` instead of exceptions
- **Property Value Conversion**: `IPropertyValueConverter` for Razor output
- **Configuration**: `IOptions<T>` pattern with appsettings binding
- **API Versioning**: Management API v1.0 endpoint structure

For frontend alignment with Umbraco.Web.UI.Client patterns, see: [Client/ARCHITECTURE.md](./Novicell.Umbraco.OEmbed/Client/ARCHITECTURE.md)
