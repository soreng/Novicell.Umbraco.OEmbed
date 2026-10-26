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
/// The oEmbed response is stored with the names of the oEmbed specification (<c>author_name</c>,
/// <c>thumbnail_url</c>, ...), as the providers return it and as the Umbraco 9 version of the package
/// stored it. Pre-release builds of this version stored camelCase (<c>authorName</c>, <c>thumbnailUrl</c>,
/// ...); that spelling is read too, so no stored value is left without its author, provider and thumbnail.
/// The result never contains a script-capable URL, see <see cref="OEmbedUrlSafety"/>.
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
            return ParseWithStoredNames(json);
        }
        catch (ArgumentException)
        {
            // A JSON object with the same property name twice, which JsonNode cannot hold (it only
            // notices when the object is first read). Read it as it is, as before, without the
            // camelCase names.
            return ParseAsIs(json);
        }
    }

    private static List<OEmbedPropertyValue?> ParseWithStoredNames(string json)
    {
        JsonNode? root = JsonNode.Parse(json);

        // The camelCase names of pre-release builds are read as the stored ones.
        OEmbedJsonNames.RenameToStored(root);

        switch (root)
        {
            case JsonArray array:
                return array.Deserialize<List<OEmbedPropertyValue?>>(Options) ?? [];

            case JsonObject single:
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
}
