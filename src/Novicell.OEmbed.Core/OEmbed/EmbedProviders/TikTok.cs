using Umbraco.Cms.Core.Media.EmbedProviders;
using Umbraco.Cms.Core.Serialization;

namespace Novicell.OEmbed.Core.OEmbed.EmbedProviders;

/// <summary>
///     Embed Provider for TikTok, the short-form video hosting platform.
/// </summary>
public class TikTok : OEmbedProviderBase
{
    public TikTok(IJsonSerializer jsonSerializer)
        : base(jsonSerializer)
    {
    }

    /// <inheritdoc/>
    public override string ApiEndpoint => "https://www.tiktok.com/oembed";

    /// <inheritdoc/>
    public override string[] UrlSchemeRegex => [@"^https?:\/\/(www\.)?tiktok\.com\/"];

    /// <inheritdoc/>
    public override Dictionary<string, string> RequestParams => [];

    /// <inheritdoc/>
    public override async Task<string?> GetMarkupAsync(string url, int? maxWidth, int? maxHeight, CancellationToken cancellationToken)
        => await GetJsonBasedMarkupAsync(url, maxWidth, maxHeight, cancellationToken);
}
