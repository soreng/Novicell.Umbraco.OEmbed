using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.Api.Models;

public record OEmbedResponseModel(
    OEmbedType Type,
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
    int? ThumbnailHeight);
