namespace Novicell.Umbraco.OEmbed.Models;

public class OEmbedOptions
{
    internal const string SectionKey = nameof(Novicell) + ":" + nameof(OEmbed);

    public bool Autodiscover { get; set; }

    /// <summary>
    /// Allows requests to loopback and private network addresses. Off by default: the server then
    /// only connects to publicly routable addresses, so an editor-supplied URL (with Autodiscover),
    /// a redirect or a discovered endpoint cannot reach internal services or a cloud metadata
    /// endpoint.
    /// </summary>
    /// <remarks>
    /// Turn this on to test with a provider on localhost, or when the server reaches the internet
    /// through an outbound proxy on a private address. With a proxy, the proxy is then responsible
    /// for restricting what can be reached. The setting is read when the HTTP client is created,
    /// so changing it needs a restart.
    /// </remarks>
    public bool AllowPrivateNetworks { get; set; }
}
