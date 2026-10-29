using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <inheritdoc />
[DataEditor(Constants.PropertyEditors.OEmbedPicker, ValueEditorIsReusable = true, ValueType = ValueTypes.Json)]
internal class OEmbedPickerPropertyEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;

    /// <inheritdoc />
    public OEmbedPickerPropertyEditor(IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper)
        : base(dataValueEditorFactory)
    {
        _ioHelper = ioHelper;
    }

    /// <inheritdoc />
    protected override IConfigurationEditor CreateConfigurationEditor()
        => new OEmbedPickerConfigurationEditor(_ioHelper);

    /// <inheritdoc />
    protected override IDataValueEditor CreateValueEditor()
        => DataValueEditorFactory.Create<OEmbedPickerPropertyValueEditor>(Attribute!);
}
