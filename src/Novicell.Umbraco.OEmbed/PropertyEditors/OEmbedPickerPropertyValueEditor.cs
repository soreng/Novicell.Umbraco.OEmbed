using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// The value editor of the OEmbed picker. The value is stored as the backoffice posted it: the URL the
/// editor entered and the provider's response, see <see cref="OEmbedDto"/>.
/// </summary>
internal sealed class OEmbedPickerPropertyValueEditor : DataValueEditor
{
    /// <inheritdoc />
    public OEmbedPickerPropertyValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute,
        ILocalizedTextService localizedTextService)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
    {
        var validators = new TypedJsonValidatorRunner<List<OEmbedDto>, OEmbedPickerConfiguration>(
            jsonSerializer,
            new OEmbedMinMaxValidator(localizedTextService),
            new OEmbedAllowedTypeValidator(localizedTextService),
            new OEmbedUrlValidator(localizedTextService));

        Validators.Add(validators);
    }
}
