using Novicell.OEmbed.Core.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Novicell.OEmbed.Core.PropertyEditors;

/// <inheritdoc />
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
            new OEmbedAllowedTypeValidator(localizedTextService));

        Validators.Add(validators);
    }
}
