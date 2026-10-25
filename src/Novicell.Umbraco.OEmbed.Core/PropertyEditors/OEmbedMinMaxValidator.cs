using System.ComponentModel.DataAnnotations;
using Novicell.Umbraco.OEmbed.Core.Models;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Novicell.Umbraco.OEmbed.Core.PropertyEditors;

/// <summary>
/// Validates the number of embeds on an OEmbed picker property against its configured
/// <see cref="OEmbedPickerConfiguration.Multiple"/> and <see cref="OEmbedPickerConfiguration.ValidationLimit"/>
/// (min/max), mirroring Umbraco's own Media Picker 3 <c>MinMaxValidator</c>
/// (<c>MediaPicker3PropertyEditor.MediaPicker3PropertyValueEditor.MinMaxValidator</c>), including its
/// <c>validation_multipleMediaNotAllowed</c>/<c>validation_entriesShort</c>/<c>validation_entriesExceed</c> checks.
/// </summary>
internal sealed class OEmbedMinMaxValidator : ITypedJsonValidator<List<OEmbedPropertyValue>, OEmbedPickerConfiguration>
{
    private readonly ILocalizedTextService _localizedTextService;

    public OEmbedMinMaxValidator(ILocalizedTextService localizedTextService)
        => _localizedTextService = localizedTextService;

    public IEnumerable<ValidationResult> Validate(
        List<OEmbedPropertyValue>? value,
        OEmbedPickerConfiguration? configuration,
        string? valueType,
        PropertyValidationContext validationContext)
    {
        var results = new List<ValidationResult>();

        if (value is null || configuration is null)
        {
            return results;
        }

        if (configuration.Multiple is false && value.Count > 1)
        {
            results.Add(new ValidationResult(
                _localizedTextService.Localize("validation", "multipleMediaNotAllowed"),
                ["value"]));
        }

        if (configuration.ValidationLimit.Min is int min && value.Count < min)
        {
            results.Add(new ValidationResult(
                _localizedTextService.Localize("validation", "entriesShort", [min.ToString(), (min - value.Count).ToString()]),
                ["value"]));
        }

        if (configuration.ValidationLimit.Max is int max && value.Count > max)
        {
            results.Add(new ValidationResult(
                _localizedTextService.Localize("validation", "entriesExceed", [max.ToString(), (value.Count - max).ToString()]),
                ["value"]));
        }

        return results;
    }
}
