using Novicell.OEmbed.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace Novicell.OEmbed.Core.PropertyEditors;

/// <summary>
/// Converts OEmbed picker property values to a strongly typed collection of <see cref="OEmbedPropertyValue"/>.
/// </summary>
/// <remarks>
/// The property value is stored as JSON: <c>[{ "url": "...", "oembed": { ... } }, ...]</c>. Legacy
/// content stored before multi-value support (a single <c>{ "url": ..., "oembed": ... }</c> object)
/// is tolerated transparently via <see cref="OEmbedPropertyValueJson.Deserialize"/>.
/// </remarks>
public class OEmbedValuePropertyValueConverter : PropertyValueConverterBase
{
    /// <inheritdoc />
    public override bool IsConverter(IPublishedPropertyType propertyType)
        => propertyType.EditorAlias == Constants.PropertyEditors.OEmbedPicker;

    /// <inheritdoc />
    public override Type GetPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(IEnumerable<OEmbedPropertyValue>);

    /// <inheritdoc />
    public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Element;

    /// <inheritdoc />
    public override object? ConvertSourceToIntermediate(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        object? source,
        bool preview)
        => OEmbedPropertyValueJson.Deserialize(source as string);

    /// <inheritdoc />
    public override object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview)
        => inter as IEnumerable<OEmbedPropertyValue>;
}
