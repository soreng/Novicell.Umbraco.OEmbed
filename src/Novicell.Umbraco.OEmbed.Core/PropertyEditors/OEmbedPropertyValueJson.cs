using System.Text.Json;
using System.Text.Json.Serialization;
using Novicell.Umbraco.OEmbed.Core.Models;

namespace Novicell.Umbraco.OEmbed.Core.PropertyEditors;

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
            return doc.RootElement.ValueKind switch
            {
                JsonValueKind.Array => JsonSerializer.Deserialize<List<OEmbedPropertyValue>>(json, Options) ?? [],
                JsonValueKind.Object => JsonSerializer.Deserialize<OEmbedPropertyValue>(json, Options) is { } single
                    ? [single]
                    : [],
                _ => [],
            };
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
