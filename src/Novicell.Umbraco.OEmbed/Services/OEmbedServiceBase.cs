using System.Net.Mime;

namespace Novicell.Umbraco.OEmbed.Services;

internal abstract class OEmbedServiceBase
{
    internal static string _oEmbedMediaTypeSuffix = "+oembed";

    private static readonly string[] _xmlMediaTypes =
        [MediaTypeNames.Text.Xml, MediaTypeNames.Application.Xml];

    private static readonly string[] _jsonMediaTypes =
        [MediaTypeNames.Application.Json];

    internal static bool IsJsonAndOEmbed(string mediaType)
    {
        return IsJson(mediaType, _oEmbedMediaTypeSuffix);
    }

    internal static bool IsXmlAndOEmbed(string mediaType)
    {
        return IsXml(mediaType, _oEmbedMediaTypeSuffix);
    }

    internal static bool IsJson(string? mediaType, string? suffix = null)
        => IsAnyOfWithSuffix(mediaType, suffix ?? string.Empty, _jsonMediaTypes);

    internal static bool IsXml(string? mediaType, string? suffix = null)
        => IsAnyOfWithSuffix(mediaType, suffix ?? string.Empty, _xmlMediaTypes);

    internal static bool IsAlternateOrAlternative(string? rel)
        => IsAnyOf(rel, "alternate", "alternative");

    private static bool IsAnyOf(string? input, params string[] options)
    {
        return !string.IsNullOrWhiteSpace(input) &&
               options.Any(x => x.Equals(input, StringComparison.InvariantCultureIgnoreCase));
    }

    private static bool IsAnyOfWithSuffix(string? input, string suffix, params string[] options)
    {
        return IsAnyOf(input, options.Select(x => x + suffix).ToArray());
    }
}
