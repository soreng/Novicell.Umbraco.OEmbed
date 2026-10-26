using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// Tolerant JSON parsing for the OEmbed picker's property value converter.
/// </summary>
/// <remarks>
/// Accepts both the current array shape (<c>[{ "url": ..., "oembed": ... }, ...]</c>) and the
/// legacy single-object shape (<c>{ "url": ..., "oembed": ... }</c>) stored by properties saved
/// before multi-value support was added.
/// The Umbraco 9 version of the package also stored the oEmbed response with the names of the oEmbed
/// specification (<c>author_name</c>, <c>thumbnail_url</c>, ...), where this version stores camelCase
/// (<c>authorName</c>, <c>thumbnailUrl</c>, ...). Both spellings are read, so content from that version
/// keeps its author, provider and thumbnail. The result never contains a script-capable URL, see
/// <see cref="OEmbedUrlSafety"/>.
/// </remarks>
internal static class OEmbedPropertyValueJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() },
    };

    /// <summary>The names the Umbraco 9 version stored, and the names they are read as.</summary>
    private static readonly (string Legacy, string Current)[] LegacyNames =
    [
        ("author_name", "authorName"),
        ("author_url", "authorUrl"),
        ("provider_name", "providerName"),
        ("provider_url", "providerUrl"),
        ("thumbnail_url", "thumbnailUrl"),
        ("thumbnail_height", "thumbnailHeight"),
        ("thumbnail_width", "thumbnailWidth"),
        ("cache_age", "cacheAge"),
    ];

    public static List<OEmbedPropertyValue> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            // What a site is handed: nothing unusable, and no script-capable URL, however the value
            // got into the database. See OEmbedUrlSafety.
            return Parse(json)
                .Select(OEmbedUrlSafety.Sanitize)
                .OfType<OEmbedPropertyValue>()
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static List<OEmbedPropertyValue?> Parse(string json)
    {
        try
        {
            return ParseWithCurrentNames(json);
        }
        catch (ArgumentException)
        {
            // A JSON object with the same property name twice, which JsonNode cannot hold (it only
            // notices when the object is first read). Read it as it is, as before, without the legacy
            // names.
            return ParseAsIs(json);
        }
    }

    private static List<OEmbedPropertyValue?> ParseWithCurrentNames(string json)
    {
        JsonNode? root = JsonNode.Parse(json);

        switch (root)
        {
            case JsonArray array:
                foreach (JsonNode? item in array)
                {
                    UseCurrentNames(item);
                }

                return array.Deserialize<List<OEmbedPropertyValue?>>(Options) ?? [];

            case JsonObject single:
                UseCurrentNames(single);
                return single.Deserialize<OEmbedPropertyValue>(Options) is { } value ? [value] : [];

            default:
                return [];
        }
    }

    private static List<OEmbedPropertyValue?> ParseAsIs(string json)
    {
        using JsonDocument doc = JsonDocument.Parse(json);

        return doc.RootElement.ValueKind switch
        {
            JsonValueKind.Array => JsonSerializer.Deserialize<List<OEmbedPropertyValue?>>(json, Options) ?? [],
            JsonValueKind.Object => JsonSerializer.Deserialize<OEmbedPropertyValue>(json, Options) is { } single
                ? [single]
                : [],
            _ => [],
        };
    }

    /// <summary>Renames the Umbraco 9 names in the item's oembed object to the current ones.</summary>
    private static void UseCurrentNames(JsonNode? item)
    {
        if (item is not JsonObject itemObject)
        {
            return;
        }

        foreach (KeyValuePair<string, JsonNode?> property in itemObject)
        {
            if (property.Key.Equals("oembed", StringComparison.OrdinalIgnoreCase) && property.Value is JsonObject response)
            {
                RenameLegacyNames(response);
            }
        }
    }

    private static void RenameLegacyNames(JsonObject response)
    {
        foreach ((var legacy, var current) in LegacyNames)
        {
            if (!response.TryGetPropertyValue(legacy, out JsonNode? value))
            {
                continue;
            }

            response.Remove(legacy);

            // The current spelling wins when both are there.
            if (!response.Any(p => p.Key.Equals(current, StringComparison.OrdinalIgnoreCase)))
            {
                response[current] = value;
            }
        }
    }
}
