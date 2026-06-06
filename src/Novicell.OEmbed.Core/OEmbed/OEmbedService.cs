using System.Net;
using System.Web;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Novicell.OEmbed.Configuration;
using Novicell.OEmbed.Core.Models;
using Novicell.OEmbed.Core.OEmbed;
using Umbraco.Cms.Core;
using Umbraco.Extension1.Services;

namespace Umbraco.Extension1.Controllers;

internal class OEmbedService(
    IOEmbedApiEndpointProvider endpointProvider,
    IOEmbedApiEndpointDiscoveryProvider endpointDiscoveryProvider,
    IHttpClientFactory httpClientFactory,
    IOptions<OEmbedOptions> oembedOptions,
    ILogger<OEmbedService> logger)
    : OEmbedServiceBase, IOEmbedService
{
    private readonly OEmbedOptions _options = oembedOptions.Value;

    public async Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> GetOEmbedAsync(
        OEmbedRequest request,
        CancellationToken cancellationToken)
    {
        var apiEndpoint = await FindApiEndpoint(request);

        if (apiEndpoint == null)
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.ProviderNotSupported);
        }

        using var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.TryParseAdd(Umbraco.Cms.Core.Constants.HttpClients.Headers
            .UserAgentProductName);

        try
        {
            var endpointUrl = BuildEndpointUrl(apiEndpoint.Endpoint, request);
            return await FetchOEmbedAsync(endpointUrl, client, cancellationToken);
        }
        catch (Exception e)
        {
            logger.LogError(e, "OEmbed request failed");
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
        }
    }

    private async Task<OEmbedApiEndpoint?> FindApiEndpoint(OEmbedRequest request)
    {
        var endpoint = await endpointProvider.GetApiEndpointAsync(request.Url);

        if (endpoint is null && _options.Autodiscover)
        {
            endpoint = await endpointDiscoveryProvider.DiscoverApiEndpointAsync(request.Url);
        }

        return endpoint;
    }

    private static Uri BuildEndpointUrl(Uri apiEndpoint, OEmbedRequest request)
    {
        var builder = new UriBuilder(apiEndpoint);

        var query = HttpUtility.ParseQueryString(builder.Query);
        query.Set("url", request.Url.ToString());
        if (request.MaxWidth > 0)
        {
            query.Set("maxwidth", request.MaxWidth.ToString());
        }

        if (request.MaxHeight > 0)
        {
            query.Set("maxheight", request.MaxHeight.ToString());
        }

        builder.Query = query.ToString();

        return builder.Uri;
    }

    private static async Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> FetchOEmbedAsync(
        Uri url,
        HttpClient client,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        using var response = await client.SendAsync(request, cancellationToken);

        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.BadRequest)
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
        }
        catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound)
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.EmbedNotFound);
        }

        var mediaType = response.Content.Headers.ContentType?.MediaType;

        return (IsJson(mediaType), IsXml(mediaType)) switch
        {
            (true, _) => await FromJsonResponseAsync(response, cancellationToken),
            (_, true) => await FromXmlResponseAsync(response, cancellationToken),
            _ => Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse)
        };
    }

    private static async Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> FromXmlResponseAsync(
        HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var i = (string? s) => s is not null && int.TryParse(s, out var n) ? n : 0;
        var u = (string? s) => Uri.TryCreate(s, UriKind.RelativeOrAbsolute, out var r) ? r : null;

        try
        {
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var xml = await XDocument.LoadAsync(stream, LoadOptions.None, cancellationToken);
            var oembed = xml.Element("oembed");

            if (oembed == null || !Enum.TryParse(oembed.Element("type")?.Value, true, out OEmbedType type))
            {
                return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
            }

            var result = new OEmbedResponse
            {
                Type = type,
                Version = oembed.Element("version")?.Value ?? "1.0",
                Title = oembed.Element("title")?.Value,
                AuthorName = oembed.Element("author_name")?.Value,
                AuthorUrl = u(oembed.Element("author_url")?.Value),
                Height = i(oembed.Element("height")?.Value),
                Width = i(oembed.Element("width")?.Value),
                ProviderName = oembed.Element("provider_name")?.Value,
                ProviderUrl = u(oembed.Element("provider_url")?.Value),
                ThumbnailHeight = i(oembed.Element("thumbnail_height")?.Value),
                ThumbnailWidth = i(oembed.Element("thumbnail_width")?.Value),
                ThumbnailUrl = u(oembed.Element("thumbnail_url")?.Value),
                Url = u(oembed.Element("url")?.Value),
                Html = type == OEmbedType.Photo ? null : oembed.Element("html")?.Value
            };

            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Succeed(OEmbedOperationStatus.Success, result);
        }
        catch
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
        }
    }

    private static async Task<Attempt<OEmbedResponse?, OEmbedOperationStatus>> FromJsonResponseAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var json = await response.Content.ReadAsStringAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(json))
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
        }

        var settings = new JsonSerializerSettings
        {
            //MissingMemberHandling = MissingMemberHandling.Ignore,
            Error = (_, args) => { args.ErrorContext.Handled = true; },
        };

        try
        {
            var result = JsonConvert.DeserializeObject<OEmbedResponse>(json, settings);

            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.If(
                result is not null,
                OEmbedOperationStatus.Success,
                OEmbedOperationStatus.InvalidResponse,
                result);
        }
        catch
        {
            return Attempt<OEmbedResponse?, OEmbedOperationStatus>.Fail(OEmbedOperationStatus.InvalidResponse);
        }
    }
}