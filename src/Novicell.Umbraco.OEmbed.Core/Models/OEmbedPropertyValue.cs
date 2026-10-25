using System.Text.Json.Serialization;

namespace Novicell.Umbraco.OEmbed.Core.Models;

/// <summary>
/// The value stored by the OEmbed picker property editor.
/// </summary>
public record OEmbedPropertyValue
{
    /// <summary>
    /// The URL originally submitted by the editor.
    /// </summary>
    public required string Url { get; init; }

    /// <summary>
    /// The resolved oEmbed response for <see cref="Url"/>.
    /// </summary>
    /// <remarks>
    /// Explicitly named: System.Text.Json's camelCase naming policy only lowercases the first
    /// character, so "OEmbed" would otherwise policy-case to "oEmbed" rather than the actual
    /// stored/posted key "oembed" - this only matters when deserializing via a serializer that
    /// isn't case-insensitive (e.g. Umbraco's shared <c>IJsonSerializer</c>, unlike this
    /// project's own tolerant <see cref="PropertyEditors.OEmbedPropertyValueJson"/> options).
    /// </remarks>
    [JsonPropertyName("oembed")]
    public required OEmbedResponse OEmbed { get; init; }
}
