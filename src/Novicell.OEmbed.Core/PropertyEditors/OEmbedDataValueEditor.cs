using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extension1.PropertyEditors;

namespace Novicell.OEmbed.Core.PropertyEditors;

/// <inheritdoc />
public class OEmbedDataValueEditor : DataValueEditor
{
    /// <inheritdoc />
    public OEmbedDataValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
        => Validators.Add(new OEmbedValueValidator());
}