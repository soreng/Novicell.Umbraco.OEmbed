using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Novicell.OEmbed.Core;
using Novicell.OEmbed.Core.Models;
using Novicell.OEmbed.Core.OEmbed;
using Novicell.OEmbed.Web.Api.Management.OEmbed.Models;

namespace Novicell.OEmbed.Web.Api.Management.OEmbed.Controllers;

[ApiController]
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = Constants.GroupName)]
public class OEmbedApiController(IOEmbedService oembedService)
    : OEmbedApiControllerBase
{
    [HttpGet("oembed")]
    [ProducesResponseType<OEmbedResponseModel>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetOEmbedAsync(
        Uri url,
        int? maxwidth,
        int? maxheight,
        CancellationToken cancellationToken)
    {
        var request = new OEmbedRequest
        {
            Url = url,
            MaxWidth = maxwidth,
            MaxHeight = maxheight
        };

        Umbraco.Cms.Core.Attempt<OEmbedResponse?, OEmbedOperationStatus> response = await oembedService
            .GetOEmbedAsync(request, cancellationToken);

        return response.Success
            ? Ok(MapToModel(response.Result!))
            : OEmbedOperationStatusResult(response.Status);
    }

    private static OEmbedResponseModel MapToModel(OEmbedResponse response)
    {
        return new OEmbedResponseModel(
            response.Type,
            response.Width,
            response.Height,
            response.Url,
            response.Html,
            response.Title,
            response.AuthorUrl,
            response.AuthorName,
            response.ProviderUrl,
            response.ProviderName,
            response.ThumbnailUrl,
            response.ThumbnailWidth,
            response.ThumbnailHeight);
    }

}
