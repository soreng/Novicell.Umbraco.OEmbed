using Novicell.OEmbed.Core;
using Umbraco.Cms.Api.Management.OpenApi;

namespace Novicell.OEmbed.Web.Api.Common.Configuration;

/// <inheritdoc />
public class OEmbedApiOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
{
    /// <inheritdoc />
    protected override string ApiName => Constants.ApiName;
}
