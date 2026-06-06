using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Api.Common.OpenApi;

namespace Novicell.OEmbed.Web.Api.Common.Configuration;

/// <inheritdoc />
public class OEmbedApiOperationIdHandler(IOptions<ApiVersioningOptions> apiVersioningOptions)
    : OperationIdHandler(apiVersioningOptions)
{
    /// <inheritdoc />
    protected override bool CanHandle(ApiDescription apiDescription,
        ControllerActionDescriptor controllerActionDescriptor)
    {
        return controllerActionDescriptor.ControllerTypeInfo.Namespace?.StartsWith(
            "Novicell.OEmbed.Web.Api.Management",
            comparisonType: StringComparison.InvariantCultureIgnoreCase) is true;
    }

    /// <inheritdoc />
    public override string Handle(ApiDescription apiDescription) =>
        $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
}
