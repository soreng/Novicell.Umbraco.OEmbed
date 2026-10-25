# Novicell.Umbraco.OEmbed — Backend Architecture

.NET backend extension for Umbraco CMS providing oEmbed protocol integration. Enables editors to embed external content (videos, images, rich embeds) by pasting URLs.

---

## 1. Project Structure

5 projects organized in a layered architecture:

### Core Layer

**`Novicell.Umbraco.OEmbed.Core`** (domain implementation)

- **No project dependencies** (besides Umbraco/Microsoft.Extensions)
- **Purpose**: Public models/interfaces, business logic, service implementations, options/configuration, property editor
- **Key types**:
    - `IOEmbedService` / `OEmbedService` — Resolves URLs to oEmbed metadata (JSON/XML handling, auto-discovery)
    - `OEmbedApiEndpointProvider` — matches a URL against Umbraco's registered `EmbedProvidersCollection`
    - `OEmbedApiEndpointDiscoveryProvider` — auto-discovery via HTTP `Link` header or `<link rel="alternate"|"alternative" type="application/json+oembed">` in the page HTML
    - `OEmbedOptions` — configuration (`Autodiscover`)
    - `OEmbedDataEditor` / `OEmbedDataValueEditor` / `OEmbedValueValidator` — property editor definition and validation
    - `OEmbedValuePropertyValueConverter` — converts the stored property JSON into a strongly-typed `OEmbedPropertyValue` for Razor views / Delivery API output
- **Configuration**: Registered via `AddNovicellOEmbedCore()` extension
- **DI Pattern**: All services registered as `Transient`

### Web Layer

**`Novicell.Umbraco.OEmbed.Web`** (API endpoints)

- **Depends on**: Core
- **Purpose**: Management API endpoint exposure
- **Key types**:
    - `OEmbedApiController` (`Api/Management/OEmbed/Controllers/OEmbedApiController.cs`) — `GET {ApiName}/api/v{version}/oembed?url=&maxwidth=&maxheight=`
    - `OEmbedApiControllerBase` — maps `OEmbedOperationStatus` to problem-details responses
    - `OEmbedResponseModel` (`Api/Management/OEmbed/Models`) — API-shape response DTO, mapped from Core's `OEmbedResponse`
    - `OEmbedApiOperationIdHandler`, `OEmbedApiOperationSecurityFilter` — Swagger/OpenAPI wiring
- **Configuration**: Registered via `AddNovicellOEmbedWeb()` extension

### Frontend Assets

**`Novicell.Umbraco.OEmbed.Web.StaticAssets`** (Lit/TypeScript components + manifest)

- **Depends on**: None (compiled TypeScript, static files)
- **Purpose**: Backoffice UI
    - Vite-built web components
    - Extension manifest (`umbraco-package.json`)
    - Generated API client from the management API's OpenAPI spec (`Client/src/api`)
    - Served as static assets via ASP.NET Core
- **See**: [Client/ARCHITECTURE.md](./Novicell.Umbraco.OEmbed.Web.StaticAssets/Client/ARCHITECTURE.md) for frontend patterns

### Startup (Composition Root)

**`Novicell.Umbraco.OEmbed.Startup`** (DI registration)

- **Depends on**: Core, Web
- **Purpose**: Bootstrap extension into Umbraco
- **Key types**:
    - `UmbracoBuilderExtensions.AddNovicellOEmbed()` — Main entry point
    - Chains `AddNovicellOEmbedCore()` → `AddNovicellOEmbedWeb()`
- **Usage**: Called in host app's `Program.cs` or plugin initialization

### Meta Package

**`Novicell.Umbraco.OEmbed`** (NuGet distribution)

- **Depends on**: Startup, Web.StaticAssets (via `<IncludeReferencedProjects>true</IncludeReferencedProjects>`)
- **Purpose**: Single NuGet package for distribution
- **Includes**: Frontend assets auto-embedded via `StaticWebAssetBasePath`
- **Distribution**: `dotnet add package Novicell.Umbraco.OEmbed` installs everything

---

## 2. Dependency Graph

```
Host App (Umbraco project)
  ↓
Novicell.Umbraco.OEmbed (meta-package)
  ├── Startup (IUmbracoBuilder.AddNovicellOEmbed())
  │   ├── Core (services, models, property editor)
  │   └── Web (API endpoints)
  │       └── Core
  └── StaticAssets (compiled TypeScript → wwwroot)
```

**Rule**: There is no separate Contracts project. Models/interfaces live directly in `Core`, the sole consumer of most of them; `Web` owns its own thin API-shape DTOs. A shared abstraction project is only worth splitting out if a second, architecturally distinct consumer needs the same types — see the precedent in Umbraco-CMS itself (e.g. `Umbraco.Cms.Api.Common`'s generic paging types) and in `Umbraco.AI`, neither of which use a Contracts-only project either.

---

## 3. Service Architecture

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
- Returns `Attempt<OEmbedResponse?, OEmbedOperationStatus>` — never throws, always returns a typed status

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

`InvalidResponse` covers all fetch/parse failures, including network errors and timeouts — a distinct `NetworkError` status was considered and deliberately not added, since the Management API returns a generic problem-details response for every failure status regardless.

### Endpoint Provider Pattern

Two complementary providers:

1. **`IOEmbedApiEndpointProvider`** — matches the URL against Umbraco's own `EmbedProvidersCollection` (YouTube, Vimeo, etc., as registered by Umbraco core) via each provider's `UrlSchemeRegex`. Fast, no network calls.
2. **`IOEmbedApiEndpointDiscoveryProvider`** — dynamic discovery. Checks the target URL's HTTP `Link` header first, then falls back to parsing `<link rel="alternate"|"alternative">` in the page HTML. Slower but supports any provider advertising oEmbed. Controlled by `OEmbedOptions.Autodiscover`.

### Property Value Converter

`OEmbedValuePropertyValueConverter` converts the property editor's stored JSON (`{ "url": "...", "oembed": { ... } }`) into an `OEmbedPropertyValue` record, so the value is usable from Razor views and the Delivery API rather than being exposed as a raw JSON string.

---

## 4. DI Registration Pattern

**Entry point**: `Startup/Configuration/UmbracoBuilderExtensions.cs`

```csharp
public static IUmbracoBuilder AddNovicellOEmbed(this IUmbracoBuilder builder)
{
    builder.AddNovicellOEmbedCore();
    builder.AddNovicellOEmbedWeb();
    return builder;
}
```

**Core registration** (`Novicell.Umbraco.OEmbed.Core/Configuration/UmbracoBuilderExtensions.cs`):

```csharp
internal static IUmbracoBuilder AddNovicellOEmbedCore(this IUmbracoBuilder builder)
{
    builder.Services.AddTransient<IOEmbedApiEndpointProvider, OEmbedApiEndpointProvider>();
    builder.Services.AddTransient<IOEmbedApiEndpointDiscoveryProvider, OEmbedApiEndpointDiscoveryProvider>();
    builder.Services.AddTransient<IOEmbedService, OEmbedService>();
    builder.Services.AddOptions<OEmbedOptions>().Bind(config.GetSection(OEmbedOptions.SectionKey));
    builder.PropertyValueConverters().Append<OEmbedValuePropertyValueConverter>();
    return builder;
}
```

**Web registration** (`Novicell.Umbraco.OEmbed.Web/Configuration/UmbracoBuilderExtensions.cs`):

```csharp
public static IUmbracoBuilder AddNovicellOEmbedWeb(this IUmbracoBuilder builder)
{
    builder.AddNovicellOEmbedManagementApi();
    return builder;
}
```

This registers the versioned Management API (Swagger doc, operation-id handler, security filter) via `WithNovicellOEmbedManagementApi()`. There is no notification handler in this project — no `ServerVariablesParsingNotification` handling exists or is required.

---

## 5. Configuration

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

**Options class** (`Novicell.Umbraco.OEmbed.Core/Models/OEmbedOptions.cs`):

```csharp
public class OEmbedOptions
{
    public bool Autodiscover { get; set; } = false;
}
```

Accessed via `IOptions<OEmbedOptions>` in services.

---

## 6. Adding Features

### Add a New Service Method

1. **Interface** in Core: Define method signature on `IOEmbedService`
2. **Implementation** in Core: Add logic to `OEmbedService`
3. **Usage**: Inject `IOEmbedService` in Web controllers or frontend via the API

### Add a New API Endpoint

1. **Controller** in Web: Inherit from `OEmbedApiControllerBase`
2. **Request/Response Models**: Add to `Web/Api/Management/OEmbed/Models`
3. **Register**: Wire up via `AddNovicellOEmbedWeb()` / `WithNovicellOEmbedManagementApi()`

### Add a New Property Editor

1. **Editor Definition** in Core: `OEmbedDataEditor` (or new)
2. **Manifest** in StaticAssets/Client/public
3. **Lit Components** in StaticAssets/Client/src

---

## 7. Testing Considerations

### Backend Tests (`tests/Novicell.Umbraco.OEmbed.Core.Tests`)

- Cover `OEmbedService` (provider matching/fallthrough, HTTP status mapping, JSON/XML parsing, XXE-hardening regression), `OEmbedValuePropertyValueConverter`, and `OEmbedValueValidator`
- Approach: mock `HttpMessageHandler` responses via `IHttpClientFactory`, assert typed `OEmbedOperationStatus` outcomes

### Frontend Tests

- Scope: components, repositories, data sources (`@web/test-runner` + MSW mocking)
- See: StaticAssets/Client docs

---

## 8. Extending the Extension

### Custom Providers

Implement `IOEmbedApiEndpointProvider` to add proprietary provider matching.

### Custom Property Editors

Create new property editors that use `IOEmbedService`.

### Frontend Customization

Override components in `StaticAssets/Client/src/oembed/` or `property-editors/`, or create new extension types.

---

## 9. Key Files Reference

| File                                                                          | Purpose                            |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| `Novicell.Umbraco.OEmbed.Startup/Configuration/UmbracoBuilderExtensions.cs`           | DI entry point                      |
| `Novicell.Umbraco.OEmbed.Core/OEmbed/OEmbedService.cs`                                | Core service implementation         |
| `Novicell.Umbraco.OEmbed.Core/PropertyEditors/OEmbedValuePropertyValueConverter.cs`   | Property value converter            |
| `Novicell.Umbraco.OEmbed.Web/Api/Management/OEmbed/Controllers/OEmbedApiController.cs` | REST endpoint                       |
| `Novicell.Umbraco.OEmbed.Web.StaticAssets/Client/src/oembed/`                         | Frontend components & logic         |
| `Novicell.Umbraco.OEmbed.Web.StaticAssets/Client/public/umbraco-package.json`         | Extension manifest                  |

---

## 10. Umbraco Patterns Used

- **DI Composition**: Umbraco's `IUmbracoBuilder` pattern
- **Result Pattern**: `Attempt<T, TStatus>` instead of exceptions
- **Property Value Conversion**: `IPropertyValueConverter` for Razor/Delivery API output
- **Configuration**: `IOptions<T>` pattern with appsettings binding
- **API Versioning**: Management API v1.0 endpoint structure

For frontend alignment with Umbraco.Web.UI.Client patterns, see: [Client/ARCHITECTURE.md](./Novicell.Umbraco.OEmbed.Web.StaticAssets/Client/ARCHITECTURE.md)
