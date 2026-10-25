using System.ComponentModel.DataAnnotations;
using Novicell.Umbraco.OEmbed.Models;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// Validates the oEmbed types on an OEmbed picker property against its configured
/// <see cref="OEmbedPickerConfiguration.AllowedTypes"/>, mirroring Umbraco's own Media Picker 3
/// <c>AllowedTypeValidator</c> and Multi Node Tree Picker <c>ObjectTypeValidator</c>
/// (reusing its <c>validation_invalidObjectType</c> message for a per-item type mismatch).
/// </summary>
internal sealed class OEmbedAllowedTypeValidator : ITypedJsonValidator<List<OEmbedPropertyValue>, OEmbedPickerConfiguration>
{
    private readonly ILocalizedTextService _localizedTextService;

    public OEmbedAllowedTypeValidator(ILocalizedTextService localizedTextService)
        => _localizedTextService = localizedTextService;

    public IEnumerable<ValidationResult> Validate(
        List<OEmbedPropertyValue>? value,
        OEmbedPickerConfiguration? configuration,
        string? valueType,
        PropertyValidationContext validationContext)
    {
        if (value is null || configuration is null || configuration.AllowedTypes.Length == 0)
        {
            return [];
        }

        var allowed = new HashSet<string>(configuration.AllowedTypes, StringComparer.OrdinalIgnoreCase);
        var results = new List<ValidationResult>();

        foreach (OEmbedPropertyValue item in value)
        {
            if (!allowed.Contains(item.OEmbed.Type.ToApiValue()))
            {
                results.Add(new ValidationResult(
                    _localizedTextService.Localize("validation", "invalidObjectType"),
                    ["value"]));
            }
        }

        return results;
    }
}
