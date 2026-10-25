using System.Net;
using System.Web;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using Novicell.Umbraco.OEmbed.Core.Models;

namespace Novicell.Umbraco.OEmbed.Core.OEmbed;

internal class OEmbedApiEndpointDiscoveryProvider(
    IHttpClientFactory httpClientFactory,
    ILogger<OEmbedApiEndpointDiscoveryProvider> logger) :
    OEmbedServiceBase, IOEmbedApiEndpointDiscoveryProvider
{
    internal record Link(string Href, string Type);

    private const string TypeAttributeName = "type";
    private const string RelAttributeName = "rel";

    /// <inheritdoc/>
    public async Task<OEmbedApiEndpoint?> DiscoverApiEndpointAsync(Uri url)
    {
        Uri? endpoint;

        try
        {
            using HttpClient client = httpClientFactory.CreateClient();
            HttpResponseMessage response = await client.GetAsync(url);

            response.EnsureSuccessStatusCode();

            endpoint = await DiscoverEndpointFromLinks(response);
        }
        catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error discovering oEmbed endpoint for url {Url}", url);

            return null;
        }

        if (endpoint == null)
        {

            return null;
        }

        if (!endpoint.IsAbsoluteUri)
        {
            endpoint = new Uri(url, endpoint);
        }

        return new OEmbedApiEndpoint(endpoint.Host, endpoint);
    }

    private static async Task<Uri?> DiscoverEndpointFromLinks(HttpResponseMessage response)
    {
        Uri? endpoint = null;

        if (response.Headers.TryGetValues("Link", out IEnumerable<string>? headerValues))
        {
            // First, try to find the link in the link-headers, since they are smaller to parse.
            var headerLinks = FindAlternateLinksInLinkHeader(headerValues).ToList();

            endpoint = GetEndpointFromLinks(headerLinks);
        }

        if (endpoint is null)
        {
            // Next, try to find the link in the html content.
            var content = await response.Content.ReadAsStringAsync();
            var htmlLinks = FindAlternateLinksInHtml(content).ToList();

            endpoint = GetEndpointFromLinks(htmlLinks);
        }

        return endpoint;
    }

    /// <summary>
    /// Find the endpoint defined in a link-header.
    /// </summary>
    /// <param name="linkHeaderValues">The link-header values from the page being disvored.</param>
    /// <returns>The endpoint found in one of the provided link-header values.</returns>
    internal static IEnumerable<Link> FindAlternateLinksInLinkHeader(IEnumerable<string> linkHeaderValues)
    {
        foreach (var headerValue in linkHeaderValues)
        {
            var inputs = headerValue
                .Split([';'], StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

            if (inputs.Length == 0)
            {
                continue;
            }

            var url = inputs[0].StartsWith('<') && inputs[0].EndsWith('>') ?
                inputs[0][1..^1] : null;

            if (url == null)
            {
                continue;
            }

            var rel = inputs.Skip(1)
                .Where(x => x.StartsWith(RelAttributeName))
                .Select(x => x[(RelAttributeName.Length + 1)..].Trim('"'))
                .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));

            if (!IsAlternateOrAlternative(rel))
            {
                continue;
            }

            var type = inputs.Skip(1)
                .Where(x => x.StartsWith(TypeAttributeName))
                .Select(x => x[(TypeAttributeName.Length + 1)..])
                .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));

            if (type is null)
            {
                continue;
            }

            yield return new Link(url, type);
        }
    }

    /// <summary>
    /// Find the endpoint defined in a link-element found in the html.
    /// </summary>
    /// <param name="html">The html content of the page being discovered.</param>
    /// <returns>The endpoint found in a link-element in the html.</returns>
    internal static IEnumerable<Link> FindAlternateLinksInHtml(string html)
    {
        var doc = new HtmlAgilityPack.HtmlDocument();

        doc.LoadHtml(html);

        IEnumerable<HtmlNode> nodes = doc.DocumentNode.Descendants()
            .Where(e => e is { NodeType: HtmlAgilityPack.HtmlNodeType.Element, Name: "link" });

        foreach (HtmlNode? node in nodes)
        {
            var rel = HttpUtility.HtmlDecode(node.GetAttributeValue(RelAttributeName, string.Empty));
            if (!IsAlternateOrAlternative(rel))
            {
                continue;
            }

            var href = HttpUtility.HtmlDecode(node.GetAttributeValue("href", string.Empty));
            var type = HttpUtility.HtmlDecode(node.GetAttributeValue(TypeAttributeName, string.Empty));

            yield return new Link(href, type);
        }
    }

    private static Uri? GetEndpointFromLinks(ICollection<Link> links)
    {
        if (!links.Any())
        {
            return null;
        }

        Link? json = links.FirstOrDefault(x => IsJsonAndOEmbed(x.Type));
        if (Uri.TryCreate(json?.Href, UriKind.RelativeOrAbsolute, out Uri? jsonUrl))
        {
            return jsonUrl;
        }

        Link? xml = links.FirstOrDefault(x => IsXmlAndOEmbed(x.Type));
        if (Uri.TryCreate(xml?.Href, UriKind.RelativeOrAbsolute, out Uri? xmlUrl))
        {
            return xmlUrl;
        }

        return null;
    }
}
