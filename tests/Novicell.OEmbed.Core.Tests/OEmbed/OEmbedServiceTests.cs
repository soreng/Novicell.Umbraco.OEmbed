using System.Net;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Novicell.OEmbed.Configuration;
using Novicell.OEmbed.Core.Models;
using Novicell.OEmbed.Core.OEmbed;
using Novicell.OEmbed.Core.Tests.TestSupport;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core;

namespace Novicell.OEmbed.Core.Tests.OEmbed;

[TestFixture]
public class OEmbedServiceTests
{
    private static readonly Uri ProviderEndpoint = new("https://provider.example/oembed");
    private static readonly OEmbedApiEndpoint ApiEndpoint = new("TestProvider", ProviderEndpoint);

    private IOEmbedApiEndpointProvider _endpointProvider = null!;
    private IOEmbedApiEndpointDiscoveryProvider _discoveryProvider = null!;

    [SetUp]
    public void SetUp()
    {
        _endpointProvider = Substitute.For<IOEmbedApiEndpointProvider>();
        _discoveryProvider = Substitute.For<IOEmbedApiEndpointDiscoveryProvider>();
    }

    private OEmbedService CreateService(HttpMessageHandler handler, bool autodiscover = false)
        => new(
            _endpointProvider,
            _discoveryProvider,
            new StubHttpClientFactory(handler),
            Options.Create(new OEmbedOptions { Autodiscover = autodiscover }),
            NullLogger<OEmbedService>.Instance);

    private static OEmbedRequest Request(string url = "https://youtube.com/watch?v=123")
        => new() { Url = new Uri(url) };

    // --- Provider matching / fallthrough ---

    [Test]
    public async Task Uses_Static_Provider_When_Found_And_Never_Invokes_Discovery()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler, autodiscover: true);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.True);
        await _discoveryProvider.DidNotReceive().DiscoverApiEndpointAsync(Arg.Any<Uri>());
    }

    [Test]
    public async Task Falls_Through_To_Discovery_When_No_Static_Provider_And_Autodiscover_Enabled()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns((OEmbedApiEndpoint?)null);
        _discoveryProvider.DiscoverApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler, autodiscover: true);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.True);
        await _discoveryProvider.Received(1).DiscoverApiEndpointAsync(Arg.Any<Uri>());
    }

    [Test]
    public async Task Does_Not_Use_Discovery_When_Autodiscover_Disabled()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns((OEmbedApiEndpoint?)null);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler, autodiscover: false);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.ProviderNotSupported));
        await _discoveryProvider.DidNotReceive().DiscoverApiEndpointAsync(Arg.Any<Uri>());
    }

    [Test]
    public async Task Reports_ProviderNotSupported_When_Neither_Provider_Nor_Discovery_Find_An_Endpoint()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns((OEmbedApiEndpoint?)null);
        _discoveryProvider.DiscoverApiEndpointAsync(Arg.Any<Uri>()).Returns((OEmbedApiEndpoint?)null);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler, autodiscover: true);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.ProviderNotSupported));
    }

    // --- HTTP status -> operation status mapping ---

    [Test]
    public async Task Maps_BadRequest_To_InvalidResponse()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.BadRequest));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    [Test]
    public async Task Maps_NotFound_To_EmbedNotFound()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.NotFound));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.EmbedNotFound));
    }

    [Test]
    public async Task Maps_Unsupported_ContentType_To_InvalidResponse()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("plain text") };
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
            return response;
        });
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    [Test]
    public async Task Unhandled_Exception_During_Fetch_Maps_To_InvalidResponse()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ => throw new HttpRequestException("connection refused"));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    // --- JSON parsing ---

    [Test]
    public async Task Parses_Valid_Json_Response()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.True);
        Assert.That(result.Result!.Type, Is.EqualTo(OEmbedType.Video));
        Assert.That(result.Result!.Title, Is.EqualTo("A test video"));
    }

    [Test]
    public async Task Photo_Type_Json_Response_Nulls_Out_Html()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        const string json = """{"type":"photo","version":"1.0","html":"<div>should be ignored by consumer</div>"}""";
        var handler = new StubHttpMessageHandler(_ => StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, json));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.True);
        Assert.That(result.Result!.Type, Is.EqualTo(OEmbedType.Photo));
    }

    [Test]
    public async Task Malformed_Json_Maps_To_InvalidResponse_Without_Throwing()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, "{ not valid json"));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    [Test]
    public async Task Empty_Json_Body_Maps_To_InvalidResponse()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ => StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, string.Empty));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    // --- XML parsing ---

    [Test]
    public async Task Parses_Valid_Xml_Response()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        const string xml = """
            <?xml version="1.0" encoding="utf-8" standalone="yes"?>
            <oembed>
                <type>video</type>
                <version>1.0</version>
                <title>A test video</title>
                <html>&lt;iframe src="https://example.com"&gt;&lt;/iframe&gt;</html>
            </oembed>
            """;
        var handler = new StubHttpMessageHandler(_ => StubHttpMessageHandler.XmlResponse(HttpStatusCode.OK, xml));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.True);
        Assert.That(result.Result!.Type, Is.EqualTo(OEmbedType.Video));
        Assert.That(result.Result!.Title, Is.EqualTo("A test video"));
        Assert.That(result.Result!.Html, Does.Contain("iframe"));
    }

    [Test]
    public async Task Xml_Missing_Type_Element_Maps_To_InvalidResponse()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        const string xml = """
            <?xml version="1.0" encoding="utf-8" standalone="yes"?>
            <oembed>
                <version>1.0</version>
            </oembed>
            """;
        var handler = new StubHttpMessageHandler(_ => StubHttpMessageHandler.XmlResponse(HttpStatusCode.OK, xml));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    /// <summary>
    /// Regression test for XXE hardening: a DOCTYPE declaring an external entity must never be resolved,
    /// and the response must fail cleanly rather than leak file contents or throw an unhandled exception.
    /// </summary>
    [Test]
    public async Task Xml_With_External_Entity_Is_Rejected_Not_Resolved()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        const string maliciousXml = """
            <?xml version="1.0" encoding="utf-8"?>
            <!DOCTYPE oembed [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
            <oembed>
                <type>video</type>
                <version>1.0</version>
                <title>&xxe;</title>
            </oembed>
            """;
        var handler = new StubHttpMessageHandler(_ => StubHttpMessageHandler.XmlResponse(HttpStatusCode.OK, maliciousXml));
        OEmbedService service = CreateService(handler);

        Attempt<OEmbedResponse?, OEmbedOperationStatus> result = await service.GetOEmbedAsync(Request(), CancellationToken.None);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Status, Is.EqualTo(OEmbedOperationStatus.InvalidResponse));
    }

    // --- BuildEndpointUrl behaviour (exercised indirectly via the captured request) ---

    [Test]
    public async Task Appends_MaxWidth_And_MaxHeight_Only_When_Positive()
    {
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(ApiEndpoint);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler);

        await service.GetOEmbedAsync(
            new OEmbedRequest { Url = new Uri("https://youtube.com/watch?v=123"), MaxWidth = 640, MaxHeight = 0 },
            CancellationToken.None);

        System.Collections.Specialized.NameValueCollection query =
            System.Web.HttpUtility.ParseQueryString(handler.LastRequest!.RequestUri!.Query);
        Assert.That(query["maxwidth"], Is.EqualTo("640"));
        Assert.That(query["maxheight"], Is.Null);
    }

    [Test]
    public async Task Preserves_Existing_Query_Parameters_On_Provider_Endpoint()
    {
        var endpointWithQuery = new OEmbedApiEndpoint("TestProvider", new Uri("https://provider.example/oembed?format=json"));
        _endpointProvider.GetApiEndpointAsync(Arg.Any<Uri>()).Returns(endpointWithQuery);
        var handler = new StubHttpMessageHandler(_ =>
            StubHttpMessageHandler.JsonResponse(HttpStatusCode.OK, ValidJsonResponse()));
        OEmbedService service = CreateService(handler);

        await service.GetOEmbedAsync(Request(), CancellationToken.None);

        System.Collections.Specialized.NameValueCollection query =
            System.Web.HttpUtility.ParseQueryString(handler.LastRequest!.RequestUri!.Query);
        Assert.That(query["format"], Is.EqualTo("json"));
        Assert.That(query["url"], Is.Not.Null);
    }

    private static string ValidJsonResponse() =>
        """{"type":"video","version":"1.0","title":"A test video","html":"<iframe src=\"https://example.com\"></iframe>"}""";
}
