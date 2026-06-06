using Novicell.OEmbed.Core.Models;

namespace Umbraco.Extension1.Services;

public interface IOEmbedApiEndpointProvider
{
    public Task<OEmbedApiEndpoint?> GetApiEndpointAsync(Uri url);
}