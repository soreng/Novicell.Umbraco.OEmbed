using System.ComponentModel.DataAnnotations;
using Novicell.Umbraco.OEmbed.Models;
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
/// The rule is <see cref="OEmbedUrlSafety"/>: the URL the editor entered must be an absolute http(s)
/// URL, and the URLs inside the stored response (author, provider, thumbnail and resource) may also be
/// relative, because some providers return those, but never an absolute URL with another scheme, and
/// never a URL with a control character in it. A null item or response is rejected too.
/// Reuses Umbraco's <c>validation_invalidPattern</c> message.
/// This is the early, friendly check. The published value converter applies the same rule to what it
/// produces, because a value does not only reach the database through this validator.
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

        // Posted JSON can contain explicit nulls (an item, or its oembed), which `required` does not
        // stop; IsSafe treats those as invalid.
        return value.Any(item => !OEmbedUrlSafety.IsSafe(item))
            ? [new ValidationResult(_localizedTextService.Localize("validation", "invalidPattern"), ["value"])]
            : [];
    }
}
