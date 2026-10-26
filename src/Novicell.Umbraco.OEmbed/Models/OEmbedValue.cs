using System.Text.Json.Serialization;

namespace Novicell.Umbraco.OEmbed.Models;

/// <summary>
/// The oEmbed data of an embed in an OEmbed picker property: what is stored in the database and what a
/// Razor view gets as <see cref="OEmbedPropertyValue.OEmbed"/>.
/// </summary>
/// <remarks>
/// This is not <see cref="OEmbedResponse"/>, which is what a provider returned and how it is parsed. The
/// fields are the same, because the backoffice stores what the provider returned, but this type has no
/// provider parsing in it, so a change there cannot change the stored value or the Razor model. It is
/// stored with the names of the oEmbed specification (<c>author_name</c>, <c>thumbnail_url</c>, ...), see
/// <see cref="PropertyEditors.OEmbedJsonNames"/>.
/// </remarks>
public record OEmbedValue
{
    /// <summary>The resource type.</summary>
    public required OEmbedType Type { get; init; }

    /// <summary>The oEmbed version number, when the provider returned one.</summary>
    public string? Version { get; set; }

    /// <summary>A text title, describing the resource.</summary>
    public string? Title { get; set; }

    /// <summary>The name of the author/owner of the resource.</summary>
    [JsonPropertyName("author_name")]
    public string? AuthorName { get; set; }

    /// <summary>A URL for the author/owner of the resource.</summary>
    [JsonPropertyName("author_url")]
    public Uri? AuthorUrl { get; set; }

    /// <summary>The name of the resource provider.</summary>
    [JsonPropertyName("provider_name")]
    public string? ProviderName { get; set; }

    /// <summary>The url of the resource provider.</summary>
    [JsonPropertyName("provider_url")]
    public Uri? ProviderUrl { get; set; }

    /// <summary>A URL to a thumbnail image representing the resource.</summary>
    [JsonPropertyName("thumbnail_url")]
    public Uri? ThumbnailUrl { get; set; }

    /// <summary>The height of the optional thumbnail.</summary>
    [JsonPropertyName("thumbnail_height")]
    public int? ThumbnailHeight { get; set; }

    /// <summary>The width of the optional thumbnail.</summary>
    [JsonPropertyName("thumbnail_width")]
    public int? ThumbnailWidth { get; set; }

    /// <summary>The HTML required to embed a video player or a rich resource.</summary>
    public string? Html { get; set; }

    /// <summary>The source URL of the image, for the <c>photo</c> type.</summary>
    public Uri? Url { get; set; }

    /// <summary>The height in pixels of the image, or of the HTML for the <c>video</c> and <c>rich</c> types.</summary>
    public int? Height { get; set; }

    /// <summary>The width in pixels of the image, or of the HTML for the <c>video</c> and <c>rich</c> types.</summary>
    public int? Width { get; set; }

    /// <summary>The suggested cache lifetime for this resource, in seconds.</summary>
    [JsonPropertyName("cache_age")]
    public int? CacheAge { get; set; }
}
