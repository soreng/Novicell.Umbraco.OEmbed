using Novicell.OEmbed.Core.Models;

namespace Novicell.OEmbed.Core.OEmbed;

public interface IOEmbedApiEndpointProvider
{
    public Task<OEmbedApiEndpoint?> GetApiEndpointAsync(Uri url);
}