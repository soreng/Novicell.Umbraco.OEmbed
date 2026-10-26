using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.Api.Models;

/// <summary>
/// The oEmbed response the backoffice receives. The property value is stored with the names of the oEmbed
/// specification instead (<c>author_name</c>, <c>thumbnail_url</c>, ...), see <see cref="PropertyEditors.OEmbedJsonNames"/>.
/// </summary>
public record OEmbedResponseModel(
    OEmbedType Type,
    string? Version,
    int? Width,
    int? Height,
    Uri? Url,
    string? Html,
    string? Title,
    Uri? AuthorUrl,
    string? AuthorName,
    Uri? ProviderUrl,
    string? ProviderName,
    Uri? ThumbnailUrl,
    int? ThumbnailWidth,
    int? ThumbnailHeight,
    int? CacheAge);
