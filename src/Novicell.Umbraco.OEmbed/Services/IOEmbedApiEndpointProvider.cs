using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.Services;

public interface IOEmbedApiEndpointProvider
{
    Task<OEmbedApiEndpoint?> GetApiEndpointAsync(Uri url);
}
