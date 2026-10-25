using Novicell.Umbraco.OEmbed.Core.Models;

namespace Novicell.Umbraco.OEmbed.Core.OEmbed;

public interface IOEmbedApiEndpointProvider
{
    Task<OEmbedApiEndpoint?> GetApiEndpointAsync(Uri url);
}
