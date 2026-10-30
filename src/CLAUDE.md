# Novicell.Umbraco.OEmbed – Backend Architecture

.NET backend extension for Umbraco CMS providing oEmbed protocol integration. Enables editors to embed external content (videos, images, rich embeds) by pasting URLs.

---

## 1. Project Structure

One Razor class library, `src/Novicell.Umbraco.OEmbed`, shipped as the NuGet package `Novicell.Umbraco.OEmbed`. The layout follows `Novicell.Umbraco.Typography`: namespaces mirror folders and the backoffice client lives in `Client/`.

```
src/Novicell.Umbraco.OEmbed/
├── Api/
│   ├── Controllers/       OEmbedApiController, OEmbedApiControllerBase
│   └── Configuration/     OEmbedApiOperationIdHandler, OEmbedApiOperationSecurityFilter
├── Composers/             OEmbedComposer
├── Configuration/         UmbracoBuilderExtensions (AddNovicellOEmbed), OEmbedOptions, OEmbedHttpClientExtensions
├── EmbedProviders/        Reddit, Spotify, TikTok (added to Umbraco's EmbedProvidersCollection)
├── Migrations/            OEmbedMigrationPlan, ConvertUmbraco9DataTypes (gives data types of the Umbraco 9 version the editor UI and the allowed types they need)
├── Models/                OEmbedResponse (what a provider returned, and what is stored), OEmbedValue (one embed as Razor gets it), OEmbedRequest, OEmbedType, the lenient JSON converters, ...
├── PropertyEditors/       OEmbedPickerPropertyEditor, OEmbedPickerPropertyValueEditor (with the validators nested in it), the index value factory, value converter
├── Services/              IOEmbedService, OEmbedService, endpoint and discovery providers, OEmbedOperationStatus
├── Client/                Lit/TypeScript backoffice UI (Vite), see Client/ARCHITECTURE.md
└── wwwroot/App_Plugins/NovicellUmbracoOEmbed/   build output of Client/, git-ignored
```

**Key types**:

- `IOEmbedService` / `OEmbedService` – Resolves URLs to oEmbed metadata (JSON handling, auto-discovery)
- `OEmbedApiEndpointProvider` – matches a URL against Umbraco's registered `EmbedProvidersCollection`
- `OEmbedApiEndpointDiscoveryProvider` – auto-discovery via HTTP `Link` header or `<link rel="alternate"|"alternative" type="application/json+oembed">` in the page HTML
- `OEmbedOptions` (`Configuration/`) – configuration (`Autodiscover`, `AllowPrivateNetworks`)
- `OEmbedPickerPropertyEditor` / `OEmbedPickerPropertyValueEditor` (with its nested `MinMaxValidator`, `AllowedTypeValidator` and `UrlValidator`) – property editor definition and validation (the last one rejects non-http(s) URLs in a saved value)
- `OEmbedPickerPropertyValueConverter` – converts the stored property JSON into a strongly-typed `OEmbedValue` for Razor views
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
- Reads JSON only: the request is sent with `format=json` (some providers, such as Flickr, answer with XML otherwise), and a response that is not `application/json` is `InvalidResponse`. The response is deserialized straight into `OEmbedResponse`, whose properties carry the provider's names and lenient converters (`OEmbedResponseConverters.cs`): a field of an unexpected kind is read as null, a width sent as text and a version sent as a number are read, and every field that has no property is kept in `OEmbedResponse.Extra` with the provider's name. Only a response without a valid `type` is `InvalidResponse`.
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

`OEmbedPickerPropertyValueConverter` converts the property editor's stored JSON (an array of `{ "url": "...", "oembed": { ... } }`, or the legacy single-object shape) into `OEmbedValue` (`Url` is a `Uri`, `OEmbed` is the `OEmbedResponse`: typed properties, `Uri` for URLs, `OEmbedType`, `int`, and `TryGetValue<T>` for fields without a property), so the value is usable from Razor views rather than being exposed as a raw JSON string. Like Umbraco's media picker, the Razor value is a single `OEmbedValue?` (the first item, or null) when the data type's `Multiple` setting is off, and an `IEnumerable<OEmbedValue>` when it is on; the Delivery API is an array either way. It also implements `IDeliveryApiPropertyValueConverter`: for the Delivery API the value is an array of `ApiOEmbedValue` (`DeliveryApi/ApiOEmbedValue.cs`, with `ApiOEmbedResponse` in its own file), a contract of its own with explicit camelCase names (and an optional `extra` object with the provider fields that have no property, under the provider's own names), so renaming the Razor model cannot change what a headless site receives. The JSON is pinned by `OEmbedDeliveryApiTests`.

**What is stored.** The database holds what the backoffice posted: the URL the editor entered and the provider's response with the provider's names (`author_name`, `thumbnail_url`, ... and every other field). The flow is: the service deserializes the provider's JSON into `OEmbedResponse` (typed fields, plus `Extra` for everything else the provider returned) → the Management API returns that `OEmbedResponse` as it is (it is the API's response type, and extension data keeps the provider's names whatever the serializer's naming policy is) → the backoffice client reads the provider names and stores the object untouched → `OEmbedPickerPropertyValueEditor` stores it as posted. There is no renaming and no mapping anywhere. The save validators and the converter read the stored value as `OEmbedDto` (`url` and `oembed` as an `OEmbedResponse`; a response without a valid type is null, so the item is reported as unusable instead of the whole value failing to read), and `OEmbedDto.ToValue()` builds the `OEmbedValue` from it. The Umbraco 9 version stored the same names as one object instead of an array; `OEmbedDto.Deserialize` reads both shapes. The converter also applies the URL rule (`OEmbedUrlSafety`) to the known URL fields it returns: a URL that is not http(s), or has a control character, is removed, and an unusable item (no URL, no response, no valid type) is left out, because the save validator is not the only way a value reaches the database. Fields without a property (`OEmbedResponse.Extra`) are exactly what the provider sent and are not checked.

---

## 3. DI Registration Pattern

**Entry point**: `Configuration/UmbracoBuilderExtensions.cs`

One method does all of it: `AddNovicellOEmbed()` registers the outbound HTTP client, the endpoint provider, the discovery provider and the service as `Transient`, binds `OEmbedOptions` to `Novicell:OEmbed`, adds the property value converter and the Reddit, Spotify and TikTok embed providers, and registers the Management API (its swagger document, the operation-id handler and the security filter). Calling it twice does not add the swagger document twice. There is no notification handler in this project.

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

**Options class** (`Configuration/OEmbedOptions.cs`):

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
2. **Request/Response models**: add them next to the controller, or in `Models` when they are also part of the public API
3. **Register**: wired up by `AddNovicellOEmbed()`; regenerate the client with `npm run generate-client`

### Add a New Embed Provider

Use the `add-embed-provider` skill (`.claude/skills/add-embed-provider`).

### Add a New Property Editor

1. **Editor definition** in `PropertyEditors`: `OEmbedPickerPropertyEditor` (or a new one)
2. **Manifest** in `Client/src`
3. **Lit components** in `Client/src`

---

## 6. Testing Considerations

### Backend Tests (`tests/Novicell.Umbraco.OEmbed.Tests`)

- Cover `OEmbedService` (provider matching/fallthrough, HTTP status mapping, JSON reading, what is kept from the response), `OEmbedPickerPropertyValueConverter`, the nested `MinMaxValidator` and `AllowedTypeValidator` of `OEmbedPickerPropertyValueEditor`
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
| `Novicell.Umbraco.OEmbed/PropertyEditors/OEmbedPickerPropertyValueConverter.cs` | Property value converter    |
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
