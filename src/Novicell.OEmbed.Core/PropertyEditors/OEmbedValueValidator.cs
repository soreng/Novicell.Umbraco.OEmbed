using System.ComponentModel.DataAnnotations;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;

namespace Novicell.OEmbed.Core.PropertyEditors;

public class OEmbedValueValidator : IValueValidator
{
    public IEnumerable<ValidationResult> Validate(object? value, string? valueType, object? dataTypeConfiguration, PropertyValidationContext validationContext)
    {
        // do we have a string value and a valid set of configuration data?
        if (value is not string stringValue
            || dataTypeConfiguration is not Dictionary<string, object?> dataTypeConfigurationValues)
        {
            // no - let's not attempt to handle this.
            return [];
        }

        // do we have a "maxChars" int configuration?
        if (!dataTypeConfigurationValues.TryGetValue("maxChars", out var maxCharsConfigurationValue)
            || maxCharsConfigurationValue is not int maxCharsValue)
        {
            // no - nothing to base our validation on.
            return [];
        }

        return stringValue.Length <= maxCharsValue
            ? []
            : [new ValidationResult($"The suggestion exceeded the max allowed characters ({maxCharsValue})")];
    }
}