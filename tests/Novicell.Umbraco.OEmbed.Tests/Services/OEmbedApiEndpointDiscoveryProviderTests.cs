using System.Net;
using Microsoft.Extensions.Logging.Abstractions;
using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.Services;
using Novicell.Umbraco.OEmbed.Tests.TestSupport;
using NUnit.Framework;

namespace Novicell.Umbraco.OEmbed.Tests.Services;

[TestFixture]
public class OEmbedApiEndpointDiscoveryProviderTests
{
    private static readonly Uri PageUrl = new("https://site.example/post/1");

    private static OEmbedApiEndpointDiscoveryProvider Create(StubHttpMessageHandler handler)
        => new(new StubHttpClientFactory(handler), NullLogger<OEmbedApiEndpointDiscoveryProvider>.Instance);

    private static HttpResponseMessage Html(string html)
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(html) };
        response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/html");
        return response;
    }

    private static string LinkElement(string href, string type = "application/json+oembed")
        => $"""<html><head><link rel="alternate" type="{type}" href="{href}" /></head><body></body></html>""";

    [Test]
    public async Task Finds_An_Absolute_Endpoint_In_The_Html()
    {
        var handler = new StubHttpMessageHandler(_ => Html(LinkElement("https://provider.example/oembed?url=x")));

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint?.Endpoint, Is.EqualTo(new Uri("https://provider.example/oembed?url=x")));
        Assert.That(endpoint?.Name, Is.EqualTo("provider.example"));
    }

    [Test]
    public async Task Resolves_A_Relative_Endpoint_Against_The_Page()
    {
        var handler = new StubHttpMessageHandler(_ => Html(LinkElement("/oembed?url=x")));

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint?.Endpoint, Is.EqualTo(new Uri("https://site.example/oembed?url=x")));
    }

    [Test]
    public async Task Finds_An_Endpoint_In_The_Link_Header()
    {
        var handler = new StubHttpMessageHandler(_ =>
        {
            HttpResponseMessage response = Html("<html></html>");
            response.Headers.TryAddWithoutValidation(
                "Link",
                "<https://provider.example/o>; rel=\"alternate\"; type=\"application/json+oembed\"");
            return response;
        });

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint?.Endpoint, Is.EqualTo(new Uri("https://provider.example/o")));
    }

    [TestCase("ftp://provider.example/oembed")]
    [TestCase("file:///etc/passwd")]
    [TestCase("javascript:alert(1)")]
    [TestCase("data:application/json,{}")]
    public async Task Ignores_An_Endpoint_That_Is_Not_Http_Or_Https(string href)
    {
        var handler = new StubHttpMessageHandler(_ => Html(LinkElement(href)));

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint, Is.Null);
    }

    [TestCase("ftp://site.example/page")]
    [TestCase("file:///etc/passwd")]
    [TestCase("javascript:alert(1)")]
    public async Task Does_Not_Request_A_Page_That_Is_Not_Http_Or_Https(string url)
    {
        var requests = 0;
        var handler = new StubHttpMessageHandler(_ =>
        {
            requests++;
            return Html(LinkElement("https://provider.example/oembed"));
        });

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(new Uri(url));

        Assert.That(endpoint, Is.Null);
        Assert.That(requests, Is.Zero);
    }

    [Test]
    public async Task Gives_Up_On_A_Page_Larger_Than_The_Limit_Even_If_The_Link_Comes_Late()
    {
        // The link is after the first megabyte, so it is only found if the whole page is read.
        var padding = new string('a', (int)OEmbedHttp.MaxResponseBytes + 1024);
        var handler = new StubHttpMessageHandler(_ =>
            Html($"<html><head><!--{padding}--><link rel=\"alternate\" type=\"application/json+oembed\" href=\"https://provider.example/oembed\" /></head></html>"));

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint, Is.Null);
    }

    [Test]
    public async Task Gives_Up_On_A_Page_Of_Unknown_Length_That_Turns_Out_To_Be_Too_Large()
    {
        var padding = new string('a', (int)OEmbedHttp.MaxResponseBytes + 1024);
        var html = $"<html><head><!--{padding}--><link rel=\"alternate\" type=\"application/json+oembed\" href=\"https://provider.example/oembed\" /></head></html>";
        var handler = new StubHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new UnknownLengthContent(System.Text.Encoding.UTF8.GetBytes(html), "text/html"),
            });

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint, Is.Null);
    }

    [Test]
    public async Task Returns_Null_When_The_Page_Is_Not_Found()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.NotFound));

        OEmbedApiEndpoint? endpoint = await Create(handler).DiscoverApiEndpointAsync(PageUrl);

        Assert.That(endpoint, Is.Null);
    }
}
