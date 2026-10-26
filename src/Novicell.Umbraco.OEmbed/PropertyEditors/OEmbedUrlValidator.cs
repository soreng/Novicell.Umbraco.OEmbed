using System.ComponentModel.DataAnnotations;
using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.Services;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// Rejects an OEmbed picker value whose URLs are not http(s). The value is posted by the client and
/// stored as is, so a script-capable URL such as <c>javascript:</c> or <c>data:</c> would otherwise be
/// saved, and later rendered as a link or an image source by the backoffice or by a site.
/// </summary>
/// <remarks>
/// The URL the editor entered must be an absolute http(s) URL, as that is all the server ever
/// resolves. The URLs inside the stored response (author, provider, thumbnail and resource) may also be
/// relative, because some providers return those, but never an absolute URL with another scheme, and
/// never a URL with a control character in it (see <see cref="HasControlCharacters"/>).
/// Reuses Umbraco's <c>validation_invalidPattern</c> message.
/// </remarks>
internal sealed class OEmbedUrlValidator : ITypedJsonValidator<List<OEmbedPropertyValue>, OEmbedPickerConfiguration>
{
    private readonly ILocalizedTextService _localizedTextService;

    public OEmbedUrlValidator(ILocalizedTextService localizedTextService)
        => _localizedTextService = localizedTextService;

    public IEnumerable<ValidationResult> Validate(
        List<OEmbedPropertyValue>? value,
        OEmbedPickerConfiguration? configuration,
        string? valueType,
        PropertyValidationContext validationContext)
    {
        if (value is null)
        {
            return [];
        }

        return value.Any(IsInvalid)
            ? [new ValidationResult(_localizedTextService.Localize("validation", "invalidPattern"), ["value"])]
            : [];
    }

    private static bool IsInvalid(OEmbedPropertyValue? item)
    {
        // Posted JSON can contain explicit nulls (an item, or its oembed), which `required` does not
        // stop. Such a value is not a valid embed.
        if (item?.OEmbed is null)
        {
            return true;
        }

        if (HasControlCharacters(item.Url)
            || !Uri.TryCreate(item.Url, UriKind.Absolute, out Uri? entered)
            || !OEmbedHttp.IsHttpUrl(entered))
        {
            return true;
        }

        OEmbedResponse response = item.OEmbed;

        return !IsHttpOrRelative(response.Url)
               || !IsHttpOrRelative(response.AuthorUrl)
               || !IsHttpOrRelative(response.ProviderUrl)
               || !IsHttpOrRelative(response.ThumbnailUrl);
    }

    private static bool IsHttpOrRelative(Uri? uri)
        => uri is null
           || (!HasControlCharacters(uri.OriginalString)
               && (!uri.IsAbsoluteUri || OEmbedHttp.IsHttpUrl(uri)));

    /// <summary>
    /// True if the text contains a control character (U+0000-U+001F, U+007F-U+009F). System.Uri accepts
    /// <c>java\nscript:alert(1)</c> as a relative URI, but browsers drop tabs and newlines from a URL
    /// and ignore leading control characters, so it becomes <c>javascript:</c> when rendered as a link.
    /// No legitimate URL has a raw control character in it (they are percent-encoded).
    /// </summary>
    private static bool HasControlCharacters(string? text)
        => text is not null && text.Any(char.IsControl);
}
