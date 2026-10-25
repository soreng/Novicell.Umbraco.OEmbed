using System.Net;
using System.Net.Sockets;
using Microsoft.Extensions.DependencyInjection;
using Novicell.Umbraco.OEmbed.Configuration;
using Novicell.Umbraco.OEmbed.Services;
using NUnit.Framework;

namespace Novicell.Umbraco.OEmbed.Tests.Services;

[TestFixture]
public class OEmbedHttpTests
{
    [TestCase("https://example.com/a", true)]
    [TestCase("http://example.com/a", true)]
    [TestCase("HTTPS://EXAMPLE.COM", true)]
    [TestCase("ftp://example.com/a", false)]
    [TestCase("file:///etc/passwd", false)]
    [TestCase("javascript:alert(1)", false)]
    [TestCase("data:text/html,x", false)]
    [TestCase("gopher://example.com", false)]
    public void IsHttpUrl_Accepts_Only_Absolute_Http_And_Https(string url, bool expected)
        => Assert.That(OEmbedHttp.IsHttpUrl(new Uri(url)), Is.EqualTo(expected));

    [Test]
    public void IsHttpUrl_Rejects_Relative_Uris_And_Null()
    {
        Assert.That(OEmbedHttp.IsHttpUrl(new Uri("/relative", UriKind.Relative)), Is.False);
        Assert.That(OEmbedHttp.IsHttpUrl(null), Is.False);
    }

    private static HttpClient CreateClient()
    {
        ServiceProvider provider = new ServiceCollection().AddOEmbedHttpClient().BuildServiceProvider();
        return provider.GetRequiredService<IHttpClientFactory>().CreateClient(OEmbedHttp.ClientName);
    }

    [Test]
    public void The_Client_Has_A_Timeout_And_A_User_Agent()
    {
        using HttpClient client = CreateClient();

        Assert.That(client.Timeout, Is.EqualTo(TimeSpan.FromSeconds(10)));
        Assert.That(client.DefaultRequestHeaders.UserAgent, Is.Not.Empty);
    }

    [TestCase(3, HttpStatusCode.OK)]
    [TestCase(4, HttpStatusCode.Redirect)]
    public async Task The_Client_Follows_At_Most_Three_Redirects(int hops, HttpStatusCode expected)
    {
        using var server = new RedirectServer();
        using HttpClient client = CreateClient();

        using HttpResponseMessage response = await client.GetAsync(server.UrlFor(hops));

        Assert.That(response.StatusCode, Is.EqualTo(expected));
    }

    /// <summary>A loopback server where /hop/N redirects to /hop/N-1 and /hop/0 answers 200.</summary>
    private sealed class RedirectServer : IDisposable
    {
        private readonly HttpListener _listener = new();
        private readonly int _port;

        public RedirectServer()
        {
            var probe = new TcpListener(IPAddress.Loopback, 0);
            probe.Start();
            _port = ((IPEndPoint)probe.LocalEndpoint).Port;
            probe.Stop();

            _listener.Prefixes.Add($"http://localhost:{_port}/");
            _listener.Start();
            _ = Task.Run(Serve);
        }

        public Uri UrlFor(int hops) => new($"http://localhost:{_port}/hop/{hops}");

        private async Task Serve()
        {
            while (_listener.IsListening)
            {
                HttpListenerContext context;
                try
                {
                    context = await _listener.GetContextAsync();
                }
                catch (Exception)
                {
                    return;
                }

                var hops = int.Parse(context.Request.Url!.Segments[^1]);
                if (hops > 0)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Redirect;
                    context.Response.RedirectLocation = $"/hop/{hops - 1}";
                }

                context.Response.Close();
            }
        }

        public void Dispose() => _listener.Close();
    }
}
