# Novicell.OEmbed — Backend Architecture

.NET backend extension for Umbraco CMS providing oEmbed protocol integration. Enables editors to embed external content (videos, images, rich embeds) by pasting URLs.

---

## 1. Project Structure

6 projects organized in a layered, dependency-inversion architecture:

### Contracts Layer

**`Novicell.OEmbed.Contracts`** (public API)

- **Purpose**: Shared request/response models and service interfaces
- **No dependencies** (except Microsoft.Extensions)
- **Exports**:
    - `IOEmbedService` — Core service interface
    - `OEmbedResponse` — API response model
    - `OEmbedOperationStatus` — Strongly-typed operation status enum

### Core Layer

**`Novicell.OEmbed.Core`** (domain implementation)

- **Depends on**: Contracts
- **Purpose**: Business logic, service implementations, options/configuration
- **Key types**:
    - `OEmbedService` — Resolves URLs to oEmbed metadata (JSON/XML handling, auto-discovery)
    - `OEmbedApiEndpointProvider` — Umbraco's embedded provider matching
    - `OEmbedApiEndpointDiscoveryProvider` — Auto-discovery via `<link rel="alternate" type="application/json+oembed">`
    - `OEmbedOptions` — Configuration (enable/disable auto-discovery)
    - `OEmbedPropertyEditor` — Property editor definition
- **Configuration**: Registered via `AddNovicellOEmbedCore()` extension
- **DI Pattern**: All services registered as `ITransient` (stateless per-request)

### Web Layer

**`Novicell.OEmbed.Web`** (API endpoints)

- **Depends on**: Core
- **Purpose**: Management API endpoint exposure
- **Key types**:
    - `OEmbedController` — REST endpoint: `POST /umbraco/management/api/v1.0/novicell-oembed/oembed`
    - Request model: `{ url?: string; maxwidth?: number; maxheight?: number }`
    - Response model: `OEmbedResponseModel` (nullable, with error handling)
- **Configuration**: Registered via `AddNovicellOEmbedWeb()` extension

### Frontend Assets

**`Novicell.OEmbed.Web.StaticAssets`** (Lit/TypeScript components + manifest)

- **Depends on**: None (compiled TypeScript, static files)
- **Purpose**: Backoffice UI
    - Vite-built web components
    - Extension manifest (`umbraco-package.json`)
    - Bundled: `novicell-oembed-manifests.js`, `novicell-oembed-app.js`
    - Served as static assets via ASP.NET Core
- **See**: [Client/ARCHITECTURE.md](./Novicell.OEmbed.Web.StaticAssets/Client/ARCHITECTURE.md) for frontend patterns

### Startup (Composition Root)

**`Novicell.OEmbed.Startup`** (DI registration)

- **Depends on**: Core, Web
- **Purpose**: Bootstrap extension into Umbraco
- **Key types**:
    - `UmbracoBuilderExtensions.AddNovicellOEmbed()` — Main entry point
    - Chains `AddNovicellOEmbedCore()` → `AddNovicellOEmbedWeb()`
- **Usage**: Called in host app's `Program.cs` or plugin initialization

### Meta Package

**`Novicell.OEmbed`** (NuGet distribution)

- **Depends on**: All 5 projects (via `<IncludeReferencedProjects>true</IncludeReferencedProjects>`)
- **Purpose**: Single NuGet package for distribution
- **Includes**: Frontend assets auto-embedded via `StaticWebAssetBasePath`
- **Distribution**: `dotnet add package Novicell.OEmbed` installs everything

---

## 2. Dependency Graph

```
Host App (Umbraco project)
  ↓
Novicell.OEmbed (meta-package)
  ├── Startup (IUmbracoBuilder.AddNovicellOEmbed())
  │   ├── Core (services, models)
  │   └── Web (API endpoints)
  │       ├── Contracts (interfaces, models)
  │       └── Core
  │           └── Contracts
  └── StaticAssets (compiled TypeScript → wwwroot)
```

**Rule**: Dependencies flow inward toward Contracts. Contracts has no dependencies (except Microsoft.Extensions).

---

## 3. Service Architecture

### IOEmbedService

**Interface** (in Contracts):

```csharp
public interface IOEmbedService
{
    Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> RequestOEmbedAsync(
        string url,
        int? maxWidth = null,
        int? maxHeight = null,
        CancellationToken cancellationToken = default
    );
}
```

**Implementation** (in Core):

- Fetches oEmbed metadata from external providers
- Supports JSON and XML responses
- Auto-discovers providers via `<link rel="alternate" type="application/json+oembed">`
- Returns `Attempt<OEmbedResponse?, OEmbedOperationStatus>` — never throws, always returns typed status

**Operation Status**:

```csharp
public enum OEmbedOperationStatus
{
    Success = 1,
    ProviderNotSupported = 2,
    EmbedNotFound = 3,
    InvalidResponse = 4,
    NetworkError = 5,
    // ... more
}
```

### Endpoint Provider Pattern

Two complementary providers:

1. **`IOEmbedApiEndpointProvider`** — Built-in Umbraco endpoint definitions
    - Static list of known providers (YouTube, Vimeo, etc.)
    - Fast, no network calls
2. **`IOEmbedApiEndpointDiscoveryProvider`** — Dynamic discovery
    - Fetches target URL and looks for `<link rel="alternate" type="application/json+oembed">`
    - Slower but supports any provider advertising oEmbed
    - Controlled by `OEmbedOptions.EnableAutodiscovery`

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

**Core registration** (in Core project):

```csharp
public static IUmbracoBuilder AddNovicellOEmbedCore(this IUmbracoBuilder builder)
{
    builder.Services.AddTransient<IOEmbedService, OEmbedService>();
    builder.Services.AddTransient<IOEmbedApiEndpointProvider, OEmbedApiEndpointProvider>();
    builder.Services.AddTransient<IOEmbedApiEndpointDiscoveryProvider, OEmbedApiEndpointDiscoveryProvider>();
    builder.Services.AddOptions<OEmbedOptions>().Bind(config.GetSection("Novicell:OEmbed"));
    return builder;
}
```

**Web registration** (in Web project):

```csharp
public static IUmbracoBuilder AddNovicellOEmbedWeb(this IUmbracoBuilder builder)
{
    builder.AddNotificationHandler<ServerVariablesParsingNotification, OEmbedServerVariablesHandler>();
    builder.Services.AddApiEndpoint<OEmbedController>();
    return builder;
}
```

---

## 5. Configuration

**appsettings.json**:

```json
{
    "Novicell": {
        "OEmbed": {
            "EnableAutodiscovery": false
        }
    }
}
```

**Options class** (in Core):

```csharp
public class OEmbedOptions
{
    public bool EnableAutodiscovery { get; set; } = false;
}
```

Accessed via `IOptions<OEmbedOptions>` in services.

---

## 6. Adding Features

### Add a New Service Method

1. **Interface** in Contracts: Define method signature
2. **Implementation** in Core: Add logic
3. **Usage**: Inject `IOEmbedService` in Web controllers or frontend via API

### Add a New API Endpoint

1. **Controller** in Web: Inherit from `ManagementApiControllerBase`
2. **Request/Response Models**: Add to Web/Api/Models
3. **Register**: Add to `AddNovicellOEmbedWeb()` via `.AddApiEndpoint<T>()`

### Add a New Property Editor

1. **Editor Definition** in Core: `OEmbedPropertyEditor` (or new)
2. **Manifest** in StaticAssets/Client/public
3. **Lit Components** in StaticAssets/Client/src

---

## 7. Testing Considerations

### Backend Tests

- **Scope**: IOEmbedService (happy path, error scenarios)
- **Approach**: Mock HTTP responses, test status codes
- **Recommended**: xUnit with Moq

### Frontend Tests

- **Scope**: Components, repositories, data sources
- **Approach**: @web/test-runner with MSW mocking
- **Recommended**: 70%+ coverage on critical paths (picker logic, API integration)
- **See**: StaticAssets/Client docs

---

## 8. Extending the Extension

### Custom Providers

Implement `IOEmbedApiEndpointProvider` to add proprietary provider matching.

### Custom Property Editors

Create new property editors that use `IOEmbedService`.

### Frontend Customization

Override components in `StaticAssets/Client/src/property-editors/` or create new extension types.

---

## 9. Key Files Reference

| File                                                                  | Purpose                     |
| --------------------------------------------------------------------- | --------------------------- |
| `Novicell.OEmbed.Startup/Configuration/UmbracoBuilderExtensions.cs`   | DI entry point              |
| `Novicell.OEmbed.Core/OEmbed/OEmbedService.cs`                        | Core service implementation |
| `Novicell.OEmbed.Web/Api/OEmbedController.cs`                         | REST endpoint               |
| `Novicell.OEmbed.Web.StaticAssets/Client/src/oembed/`                 | Frontend components & logic |
| `Novicell.OEmbed.Web.StaticAssets/Client/public/umbraco-package.json` | Extension manifest          |

---

## 10. Umbraco Patterns Used

- **DI Composition**: Umbraco's `IUmbracoBuilder` pattern
- **Result Pattern**: `Attempt<T, TStatus>` instead of exceptions
- **Notifications**: Integrate with Umbraco's notification system where needed
- **Configuration**: `IOptions<T>` pattern with appsettings binding
- **API Versioning**: Management API v1.0 endpoint structure

---

**This backend is production-ready and follows Umbraco conventions. No changes needed.**

For frontend alignment with Umbraco.Web.UI.Client patterns, see: [Client/ARCHITECTURE.md](./Novicell.OEmbed.Web.StaticAssets/Client/ARCHITECTURE.md)
