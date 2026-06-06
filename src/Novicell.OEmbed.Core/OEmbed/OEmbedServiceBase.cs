using System.Net.Mime;

namespace Novicell.OEmbed.Core.OEmbed;

internal abstract class OEmbedServiceBase
{
    internal static string OEmbedMediaTypeSuffix = "+oembed";

    private static readonly string[] XmlMediaTypes =
        [MediaTypeNames.Text.Xml, MediaTypeNames.Application.Xml];

    private static readonly string[] JsonMediaTypes =
        [MediaTypeNames.Application.Json];

    internal static bool IsJsonAndOEmbed(string mediaType)
    {
        return IsJson(mediaType, OEmbedMediaTypeSuffix);
    }

    internal static bool IsXmlAndOEmbed(string mediaType)
    {
        return IsXml(mediaType, OEmbedMediaTypeSuffix);
    }
    
    internal static bool IsJson(string? mediaType, string? suffix = null)
        => IsAnyOfWithSuffix(mediaType, suffix ?? string.Empty, JsonMediaTypes);

    internal static bool IsXml(string? mediaType, string? suffix = null)
        => IsAnyOfWithSuffix(mediaType, suffix??string.Empty, XmlMediaTypes);

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