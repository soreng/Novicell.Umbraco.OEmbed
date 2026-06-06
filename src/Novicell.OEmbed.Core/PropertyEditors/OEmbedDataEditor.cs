using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;

namespace Novicell.OEmbed.Core.PropertyEditors;

/// <inheritdoc />
[DataEditor(Constants.PropertyEditors.OEmbedPicker, ValueEditorIsReusable = true, ValueType = ValueTypes.Json)]
public class OEmbedDataEditor : DataEditor
{
    /// <inheritdoc />
    public OEmbedDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }

    /// <inheritdoc />
    protected override IDataValueEditor CreateValueEditor()
        => DataValueEditorFactory.Create<OEmbedDataValueEditor>(Attribute!);
}