using System.ComponentModel.DataAnnotations;
using Novicell.Umbraco.OEmbed.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Editors;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// The value editor of the OEmbed picker. The backoffice works with camelCase names, like the Management
/// API it gets the response from, and the database has the names of the oEmbed specification, see
/// <see cref="OEmbedJsonNames"/>: the names are converted when a value is saved and when it is loaded.
/// </summary>
public class OEmbedDataValueEditor : DataValueEditor
{
    /// <inheritdoc />
    public OEmbedDataValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute,
        ILocalizedTextService localizedTextService)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
    {
        var validators = new TypedJsonValidatorRunner<List<OEmbedPropertyValue>, OEmbedPickerConfiguration>(
            jsonSerializer,
            new OEmbedMinMaxValidator(localizedTextService),
            new OEmbedAllowedTypeValidator(localizedTextService),
            new OEmbedUrlValidator(localizedTextService));

        Validators.Add(new StoredNamesValidator(validators));
    }

    /// <inheritdoc />
    public override object? FromEditor(ContentPropertyData editorValue, object? currentValue)
        => base.FromEditor(new ContentPropertyData(OEmbedJsonNames.ToStored(editorValue.Value), editorValue.DataTypeConfiguration), currentValue);

    /// <inheritdoc />
    public override object? ToEditor(IProperty property, string? culture = null, string? segment = null)
        => OEmbedJsonNames.ToEditor(base.ToEditor(property, culture, segment));

    /// <summary>
    /// Validators run on the value the editor posted, before <see cref="FromEditor"/>. They are written
    /// for the stored names (the value is deserialized into <see cref="OEmbedResponse"/>), so they get
    /// the value with those names.
    /// </summary>
    private sealed class StoredNamesValidator(IValueValidator inner) : IValueValidator
    {
        public IEnumerable<ValidationResult> Validate(
            object? value,
            string? valueType,
            object? dataTypeConfiguration,
            PropertyValidationContext validationContext)
            => inner.Validate(OEmbedJsonNames.ToStored(value), valueType, dataTypeConfiguration, validationContext);
    }
}
