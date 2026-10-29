using System.Text.Json;
using Novicell.Umbraco.OEmbed.Models;

namespace Novicell.Umbraco.OEmbed.Migrations;

/// <summary>
/// What a data type of the Umbraco 9 version needs to work with this version: it keeps the editor alias, but
/// it has no editor UI of its own, and its one setting has another name and shape.
/// </summary>
internal static class Umbraco9DataTypes
{
    /// <summary>The alias of the property editor UI in the backoffice, see the client manifest.</summary>
    public const string EditorUiAlias = "Novicell.PropertyEditorUi.OEmbedPicker";

    /// <summary>
    /// Updates the row, and returns whether anything changed. It changes nothing a second time, and nothing
    /// that is already in the current shape.
    /// </summary>
    public static bool Convert(DataTypeRow row)
    {
        var changed = false;

        // Without a UI alias Umbraco falls back to the editor alias, and no UI is registered under that name.
        if (string.IsNullOrWhiteSpace(row.EditorUiAlias) || row.EditorUiAlias == row.EditorAlias)
        {
            row.EditorUiAlias = EditorUiAlias;
            changed = true;
        }

        if (ConvertConfiguration(row.Configuration) is { } configuration)
        {
            row.Configuration = configuration;
            changed = true;
        }

        return changed;
    }

    /// <summary>
    /// Converts the setting of the old version, <c>{ "Type": "Video" }</c>, to the allowed types, or returns
    /// null when the configuration is anything else (including the current shape).
    /// </summary>
    internal static string? ConvertConfiguration(string? configuration)
    {
        if (string.IsNullOrWhiteSpace(configuration))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(configuration);

            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            string? type = null;
            var hasType = false;

            foreach (JsonProperty property in document.RootElement.EnumerateObject())
            {
                if (property.NameEquals("allowedTypes") || property.NameEquals("multiple") || property.NameEquals("validationLimit"))
                {
                    return null;
                }

                if (property.Name.Equals("type", StringComparison.OrdinalIgnoreCase))
                {
                    hasType = true;
                    type = property.Value.ValueKind == JsonValueKind.String ? property.Value.GetString() : null;
                }
            }

            if (!hasType)
            {
                return null;
            }

            // Empty, the old "(Any)", and anything that is not one of the four types means no restriction.
            OEmbedType? allowed = Enum.GetValues<OEmbedType>()
                .Cast<OEmbedType?>()
                .FirstOrDefault(candidate => string.Equals(candidate.ToString(), type, StringComparison.OrdinalIgnoreCase));

            return JsonSerializer.Serialize(new Dictionary<string, string[]>
            {
                ["allowedTypes"] = allowed is { } value ? [value.ToApiValue()] : [],
            });
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
