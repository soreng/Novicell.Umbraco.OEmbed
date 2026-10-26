using System.Text.Json;
using System.Text.Json.Serialization;
using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// Tolerant JSON parsing shared by the OEmbed picker's property value converter and validator.
/// </summary>
/// <remarks>
/// Accepts both the current array shape (<c>[{ "url": ..., "oembed": ... }, ...]</c>) and the
/// legacy single-object shape (<c>{ "url": ..., "oembed": ... }</c>) stored by properties saved
/// before multi-value support was added.
/// </remarks>
internal static class OEmbedPropertyValueJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() },
    };

    public static List<OEmbedPropertyValue> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            using JsonDocument doc = JsonDocument.Parse(json);
            List<OEmbedPropertyValue?> parsed = doc.RootElement.ValueKind switch
            {
                JsonValueKind.Array => JsonSerializer.Deserialize<List<OEmbedPropertyValue?>>(json, Options) ?? [],
                JsonValueKind.Object => JsonSerializer.Deserialize<OEmbedPropertyValue>(json, Options) is { } single
                    ? [single]
                    : [],
                _ => [],
            };

            // What a site is handed: nothing unusable, and no script-capable URL, however the value
            // got into the database. See OEmbedUrlSafety.
            return parsed
                .Select(OEmbedUrlSafety.Sanitize)
                .OfType<OEmbedPropertyValue>()
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
