using System.Text.Json.Serialization;
using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.DeliveryApi;

/// <summary>
/// One embed of an OEmbed picker property, as the Delivery API returns it.
/// </summary>
/// <remarks>
/// This is the contract for headless sites, and it is deliberately separate from the model used in
/// Razor (<see cref="OEmbedPropertyValue"/>), so that renaming or reshaping that model cannot change
/// what a site receives by accident. The property names are written out for the same reason, and are
/// camelCase like the rest of the Delivery API. A property with several embeds is an array of these.
/// The <see cref="ApiOEmbedValue.Html"/> is what the provider returned when the editor picked the
/// URL, and is not verified, so a site should treat it as editor-supplied content.
/// </remarks>
/// <param name="Url">The URL the editor entered.</param>
/// <param name="OEmbed">The oEmbed response for <paramref name="Url"/>.</param>
public sealed record ApiOEmbed(
    [property: JsonPropertyName("url")] string Url,
    [property: JsonPropertyName("oembed")] ApiOEmbedValue OEmbed)
{
    internal static ApiOEmbed From(OEmbedPropertyValue value)
        => new(value.Url, ApiOEmbedValue.From(value.OEmbed));
}

/// <summary>
/// The oEmbed response of an <see cref="ApiOEmbed"/>, with the fields of the oEmbed specification.
/// Fields the provider did not return are null.
/// </summary>
/// <param name="Type">The resource type: <c>video</c>, <c>photo</c>, <c>link</c> or <c>rich</c>.</param>
/// <param name="Version">The oEmbed version, when the provider returned one.</param>
/// <param name="Title">A text title describing the resource.</param>
/// <param name="AuthorName">The name of the author or owner of the resource.</param>
/// <param name="AuthorUrl">A URL for the author or owner of the resource.</param>
/// <param name="ProviderName">The name of the resource provider.</param>
/// <param name="ProviderUrl">The URL of the resource provider.</param>
/// <param name="ThumbnailUrl">A URL to a thumbnail image representing the resource.</param>
/// <param name="ThumbnailHeight">The height of the thumbnail, in pixels.</param>
/// <param name="ThumbnailWidth">The width of the thumbnail, in pixels.</param>
/// <param name="Html">The HTML to embed, for the <c>video</c> and <c>rich</c> types.</param>
/// <param name="Url">The URL of the resource, for the <c>photo</c> type.</param>
/// <param name="Height">The height of the resource, in pixels.</param>
/// <param name="Width">The width of the resource, in pixels.</param>
/// <param name="CacheAge">How long, in seconds, the provider suggests the response is cached.</param>
public sealed record ApiOEmbedValue(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("version")] string? Version,
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("authorName")] string? AuthorName,
    [property: JsonPropertyName("authorUrl")] string? AuthorUrl,
    [property: JsonPropertyName("providerName")] string? ProviderName,
    [property: JsonPropertyName("providerUrl")] string? ProviderUrl,
    [property: JsonPropertyName("thumbnailUrl")] string? ThumbnailUrl,
    [property: JsonPropertyName("thumbnailHeight")] int? ThumbnailHeight,
    [property: JsonPropertyName("thumbnailWidth")] int? ThumbnailWidth,
    [property: JsonPropertyName("html")] string? Html,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("height")] int? Height,
    [property: JsonPropertyName("width")] int? Width,
    [property: JsonPropertyName("cacheAge")] int? CacheAge)
{
    internal static ApiOEmbedValue From(OEmbedValue response)
        => new(
            response.Type.ToApiValue(),
            response.Version,
            response.Title,
            response.AuthorName,
            response.AuthorUrl?.OriginalString,
            response.ProviderName,
            response.ProviderUrl?.OriginalString,
            response.ThumbnailUrl?.OriginalString,
            response.ThumbnailHeight,
            response.ThumbnailWidth,
            response.Html,
            response.Url?.OriginalString,
            response.Height,
            response.Width,
            response.CacheAge);
}
