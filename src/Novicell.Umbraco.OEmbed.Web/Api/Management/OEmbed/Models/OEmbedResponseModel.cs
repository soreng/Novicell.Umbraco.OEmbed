using Novicell.Umbraco.OEmbed.Core.Models;

namespace Novicell.Umbraco.OEmbed.Web.Api.Management.OEmbed.Models;

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
