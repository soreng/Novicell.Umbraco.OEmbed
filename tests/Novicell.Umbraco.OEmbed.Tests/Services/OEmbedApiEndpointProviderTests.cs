using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.Services;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core.Media;
using Umbraco.Cms.Core.Media.EmbedProviders;
using Umbraco.Cms.Core.Serialization;

namespace Novicell.Umbraco.OEmbed.Tests.Services;

[TestFixture]
public class OEmbedApiEndpointProviderTests
{
    [TestCase("https://vimeo.com/api/oembed.xml", "https://vimeo.com/api/oembed.json")]
    [TestCase("http://www.ted.com/talks/oembed.xml", "http://www.ted.com/talks/oembed.json")]
    [TestCase("https://vimeo.com/api/oembed.XML", "https://vimeo.com/api/oembed.json")]
    [TestCase("https://vimeo.com/api/oembed.xml?width=100", "https://vimeo.com/api/oembed.json?width=100")]
    [TestCase("https://www.youtube.com/oembed", "https://www.youtube.com/oembed")]
    [TestCase("http://www.hulu.com/api/oembed.json", "http://www.hulu.com/api/oembed.json")]
    [TestCase("https://example.com/xml/oembed", "https://example.com/xml/oembed")]
    [TestCase("https://example.com/oembed?format=a.xml", "https://example.com/oembed?format=a.xml")]
    public void An_Endpoint_That_Is_Xml_By_Its_Path_Is_Changed_To_Json(string endpoint, string expected)
        => Assert.That(OEmbedApiEndpointProvider.ToJsonEndpoint(new Uri(endpoint)), Is.EqualTo(new Uri(expected)));

    [Test]
    public async Task Vimeo_Is_Asked_At_Its_Json_Endpoint()
    {
        var vimeo = new Vimeo(Substitute.For<IJsonSerializer>());
        var provider = new OEmbedApiEndpointProvider(new EmbedProvidersCollection(() => [vimeo]));

        OEmbedApiEndpoint? endpoint = await provider.GetApiEndpointAsync(new Uri("https://vimeo.com/371827688"));

        Assert.That(endpoint, Is.Not.Null);
        Assert.That(endpoint!.Endpoint.AbsolutePath, Does.EndWith("/oembed.json"));
    }

    [Test]
    public void None_Of_Umbracos_Providers_Is_Left_With_An_Xml_Endpoint()
    {
        var providers = typeof(Vimeo).Assembly.GetTypes()
            .Where(t => typeof(IEmbedProvider).IsAssignableFrom(t) && t is { IsAbstract: false, IsPublic: true, Namespace: "Umbraco.Cms.Core.Media.EmbedProviders" })
            .Select(t => (IEmbedProvider)Activator.CreateInstance(t, [Substitute.For<IJsonSerializer>()])!)
            .ToList();

        Assert.That(providers, Is.Not.Empty);

        foreach (IEmbedProvider provider in providers)
        {
            Uri endpoint = OEmbedApiEndpointProvider.ToJsonEndpoint(new Uri(provider.ApiEndpoint));

            Assert.That(endpoint.AbsolutePath, Does.Not.EndWith(".xml").IgnoreCase, provider.GetType().Name);
        }
    }
}
