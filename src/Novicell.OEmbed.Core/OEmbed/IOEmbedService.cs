using Novicell.OEmbed.Core.Models;
using Umbraco.Cms.Core;
using OEmbedResponse = Novicell.OEmbed.Core.Models.OEmbedResponse;

namespace Novicell.OEmbed.Core.OEmbed;

public interface IOEmbedService
{
    Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> GetOEmbedAsync(
        OEmbedRequest request,
        CancellationToken cancellationToken);
}
