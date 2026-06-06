using Novicell.OEmbed.Core.Models;
using Novicell.OEmbed.Core.OEmbed;
using Umbraco.Cms.Core;
using Umbraco.Extension1.Services;
using OEmbedResponse = Novicell.OEmbed.Core.Models.OEmbedResponse;

namespace Umbraco.Extension1.Controllers;

public interface IOEmbedService
{
    Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> GetOEmbedAsync(
        OEmbedRequest request,
        CancellationToken cancellationToken);
}