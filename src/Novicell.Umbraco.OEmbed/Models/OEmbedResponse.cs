using System.Runtime.Serialization;

namespace Novicell.Umbraco.OEmbed.Models;

/// <summary>
/// OEmbed Provider Response.
/// </summary>
/// <remarks>
/// What a provider returned, as parsed by <see cref="Services.IOEmbedService"/>. The value that is stored in a property and
/// given to Razor is an <see cref="OEmbedValue"/>.
/// The response returned by the provider can be in either JSON or XML. Each format specifies a way of encoding
/// name-value pairs which comprise the response data. Each format has an associated mime-type which must be
/// returned in the Content-type header along with the response.</remarks>
[DataContract]
public record OEmbedResponse
{
    /// <summary>
    /// The resource type. Valid values, along with value-specific parameters, are described below.
    /// </summary>
    [DataMember(Name = "type")]
    public required OEmbedType Type { get; init; }

    /// <summary>
    /// The oEmbed version number. This must be 1.0.
    /// </summary>
    /// <remarks>
    /// Optional rather than required: some providers leave it out, although the specification requires it.
    /// </remarks>
    [DataMember(Name = "version")]
    public string? Version { get; set; }

    /// <summary>
    /// A text title, describing the resource.
    /// </summary>
    [DataMember(Name = "title")]
    public string? Title { get; set; }

    /// <summary>
    /// The name of the author/owner of the resource.
    /// </summary>
    [DataMember(Name = "author_name")]
    public string? AuthorName { get; set; }

    /// <summary>
    /// A URL for the author/owner of the resource.
    /// </summary>
    [DataMember(Name = "author_url")]
    public Uri? AuthorUrl { get; set; }

    /// <summary>
    /// The name of the resource provider.
    /// </summary>
    [DataMember(Name = "provider_name")]
    public string? ProviderName { get; set; }

    /// <summary>
    /// The url of the resource provider.
    /// </summary>
    [DataMember(Name = "provider_url")]
    public Uri? ProviderUrl { get; set; }

    /// <summary>
    /// A URL to a thumbnail image representing the resource.
    /// </summary>
    /// <remarks>
    /// The thumbnail must respect any maxwidth and maxheight parameters. If this parameter is present, <see cref="ThumbnailWidth"/> and <see cref="ThumbnailHeight"/> must also be present.
    /// </remarks>
    [DataMember(Name = "thumbnail_url")]
    public Uri? ThumbnailUrl { get; set; }

    /// <summary>
    /// The height of the optional thumbnail. 
    /// </summary>
    /// <remarks>
    /// If this parameter is present, <see cref="ThumbnailUrl" /> and <see cref="ThumbnailWidth"/> must also be present.
    /// </remarks>
    [DataMember(Name = "thumbnail_height")]
    public int? ThumbnailHeight { get; set; }

    /// <summary>
    /// The width of the optional thumbnail. 
    /// </summary>
    /// <remarks>
    /// If this parameter is present, <see cref="ThumbnailUrl" /> and <see cref="ThumbnailHeight"/> must also be present.
    /// </remarks>
    [DataMember(Name = "thumbnail_width")]
    public int? ThumbnailWidth { get; set; }

    /// <summary>
    /// The HTML required to embed a video player.
    /// </summary>
    /// <remarks>The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities.</remarks>
    [DataMember(Name = "html")]
    public string? Html { get; set; }

    /// <summary>
    /// The source URL of the image.
    /// </summary>
    /// <remarks>Consumers should be able to insert this URL into an &lt;img&gt; element. Only HTTP and HTTPS URLs are valid.</remarks>
    [DataMember(Name = "url")]
    public Uri? Url { get; set; }

    /// <summary>
    /// The height in pixels of the image specified in the <see cref="Url" /> parameter.
    /// </summary>
    /// <remarks>When <see cref="Type"/> is <see cref="OEmbedType.Video"/> or <see cref="OEmbedType.Rich"/>, this is height in pixels required to display the HTML.</remarks>
    [DataMember(Name = "height")]
    public int? Height { get; set; }

    /// <summary>
    /// The width in pixels of the image specified in the <see cref="Url" /> parameter.
    /// </summary>
    /// <remarks>When <see cref="Type"/> is <see cref="OEmbedType.Video"/> or <see cref="OEmbedType.Rich"/>, this is width in pixels required to display the HTML.</remarks>
    [DataMember(Name = "width")]
    public int? Width { get; set; }

    /// <summary>
    /// The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not.
    /// </summary>
    [DataMember(Name = "cache_age")]
    public int? CacheAge { get; set; }
}
