using Novicell.Umbraco.OEmbed.Core;
using Umbraco.Cms.Api.Management.OpenApi;

namespace Novicell.Umbraco.OEmbed.Web.Api.Common.Configuration;

/// <inheritdoc />
public class OEmbedApiOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
{
    /// <inheritdoc />
    protected override string ApiName => Constants.ApiName;
}
