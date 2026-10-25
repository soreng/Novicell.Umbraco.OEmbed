using Novicell.Umbraco.OEmbed.Core.Models;

namespace Novicell.Umbraco.OEmbed.Core.OEmbed;

public interface IOEmbedApiEndpointDiscoveryProvider
{
    /// <summary>
    /// Discover the OEmbed endpoint of the provided url.
    /// </summary>
    /// <remarks>
    /// https://oembed.com/#section4
    /// oEmbed providers can choose to make their oEmbed support discoverable by adding
    /// elements to the head of their existing (X)HTML documents.
    /// The URLs contained within the href attribute should be the full oEmbed endpoint
    /// plus URL and any needed format parameter. No other request parameters should be
    /// included in this URL.
    /// The type attribute must contain either application/json+oembed for JSON responses,
    /// or text/xml+oembed for XML.
    /// </remarks>
    /// <param name="url">The url of the (X)HTML document that contains the resource that should be embedded.</param>
    /// <returns>If discovered, an <see cref="OEmbedApiEndpoint"/> that points to the endpoint.</returns>
    Task<OEmbedApiEndpoint?> DiscoverApiEndpointAsync(Uri url);
}
