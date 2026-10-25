using Novicell.Umbraco.OEmbed.Core.Models;
using Umbraco.Cms.Core;
using OEmbedResponse = Novicell.Umbraco.OEmbed.Core.Models.OEmbedResponse;

namespace Novicell.Umbraco.OEmbed.Core.OEmbed;

public interface IOEmbedService
{
    Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> GetOEmbedAsync(
        OEmbedRequest request,
        CancellationToken cancellationToken);
}
