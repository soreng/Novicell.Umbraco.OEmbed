using System.Text.Json;
using System.Text.Json.Nodes;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// The two spellings of the oEmbed response in an OEmbed picker value.
/// </summary>
/// <remarks>
/// The value is stored with the names of the oEmbed specification (<c>author_name</c>, <c>thumbnail_url</c>,
/// ...), so that what is in the database is as close as possible to what the provider returned, and is what
/// the Umbraco 9 version of the package stored. The backoffice, like the rest of the Management API, uses
/// camelCase (<c>authorName</c>, <c>thumbnailUrl</c>, ...). <see cref="OEmbedDataValueEditor"/> converts
/// between the two when a value is saved and loaded, and the same table lets the property value converter
/// read values that were stored with camelCase names by pre-release builds.
/// Only the names inside an item's <c>oembed</c> object are concerned; the others are the same in both.
/// </remarks>
internal static class OEmbedJsonNames
{
    private static readonly (string Editor, string Stored)[] Names =
    [
        ("authorName", "author_name"),
        ("authorUrl", "author_url"),
        ("providerName", "provider_name"),
        ("providerUrl", "provider_url"),
        ("thumbnailUrl", "thumbnail_url"),
        ("thumbnailHeight", "thumbnail_height"),
        ("thumbnailWidth", "thumbnail_width"),
        ("cacheAge", "cache_age"),
    ];

    /// <summary>Changes the camelCase names of the editor to the stored names.</summary>
    /// <returns>The value in the same kind of object as it came in (a string stays a string).</returns>
    public static object? ToStored(object? value) => Convert(value, toStored: true);

    /// <summary>Changes the stored names to the camelCase names of the editor.</summary>
    /// <returns>The value in the same kind of object as it came in (a string stays a string).</returns>
    public static object? ToEditor(object? value) => Convert(value, toStored: false);

    /// <summary>Renames in place, for a node that is already parsed (and not shared).</summary>
    public static void RenameToStored(JsonNode? root) => Rename(root, toStored: true);

    private static object? Convert(object? value, bool toStored)
    {
        try
        {
            switch (value)
            {
                case string json when !string.IsNullOrWhiteSpace(json):
                    JsonNode? parsed = JsonNode.Parse(json);
                    Rename(parsed, toStored);
                    return parsed?.ToJsonString() ?? json;

                case JsonNode node:
                    JsonNode copy = node.DeepClone();
                    Rename(copy, toStored);
                    return copy;

                case JsonElement element:
                    JsonNode? fromElement = JsonNode.Parse(element.GetRawText());
                    Rename(fromElement, toStored);
                    return fromElement is null ? value : JsonSerializer.SerializeToElement(fromElement);

                default:
                    return value;
            }
        }
        catch (Exception ex) when (ex is JsonException or ArgumentException or InvalidOperationException)
        {
            // Not JSON, or an object with the same property name twice (which JsonNode only notices when
            // it is read). The value is left as it is; the validators and the converter deal with it.
            return value;
        }
    }

    private static void Rename(JsonNode? root, bool toStored)
    {
        switch (root)
        {
            case JsonArray array:
                foreach (JsonNode? item in array)
                {
                    RenameItem(item, toStored);
                }

                break;

            case JsonObject single:
                RenameItem(single, toStored);
                break;
        }
    }

    private static void RenameItem(JsonNode? item, bool toStored)
    {
        if (item is not JsonObject itemObject)
        {
            return;
        }

        foreach (KeyValuePair<string, JsonNode?> property in itemObject)
        {
            if (property.Key.Equals("oembed", StringComparison.OrdinalIgnoreCase) && property.Value is JsonObject response)
            {
                RenameResponse(response, toStored);
            }
        }
    }

    private static void RenameResponse(JsonObject response, bool toStored)
    {
        foreach ((var editor, var stored) in Names)
        {
            (string from, string to) = toStored ? (editor, stored) : (stored, editor);

            if (!response.TryGetPropertyValue(from, out JsonNode? value))
            {
                continue;
            }

            response.Remove(from);

            // The name that is already in the target spelling wins when both are there.
            if (!response.Any(p => p.Key.Equals(to, StringComparison.OrdinalIgnoreCase)))
            {
                response[to] = value;
            }
        }
    }
}
