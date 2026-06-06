using Novicell.OEmbed.Core.Models;

namespace Novicell.OEmbed.Core.OEmbed;

public interface IOEmbedApiEndpointProvider
{
    Task<OEmbedApiEndpoint?> GetApiEndpointAsync(Uri url);
}
