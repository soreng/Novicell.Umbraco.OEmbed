using Novicell.Umbraco.OEmbed.DeliveryApi;
using Novicell.Umbraco.OEmbed.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.DeliveryApi;

namespace Novicell.Umbraco.OEmbed.PropertyEditors;

/// <summary>
/// Converts OEmbed picker property values to a strongly typed collection of <see cref="OEmbedPropertyValue"/>.
/// </summary>
/// <remarks>
/// The property value is stored as JSON: <c>[{ "url": "...", "oembed": { ... } }, ...]</c>. Legacy
/// content stored before multi-value support (a single <c>{ "url": ..., "oembed": ... }</c> object)
/// is tolerated transparently via <see cref="OEmbedPropertyValueJson.Deserialize"/>.
/// For the Delivery API the value is an array of <see cref="ApiOEmbed"/>, a contract of its own that
/// does not follow the Razor model.
/// </remarks>
public class OEmbedValuePropertyValueConverter : PropertyValueConverterBase, IDeliveryApiPropertyValueConverter
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

    /// <inheritdoc />
    public PropertyCacheLevel GetDeliveryApiPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Element;

    /// <inheritdoc />
    public Type GetDeliveryApiPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(IEnumerable<ApiOEmbed>);

    /// <inheritdoc />
    public object? ConvertIntermediateToDeliveryApiObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview,
        bool expanding)
        => (inter as IEnumerable<OEmbedPropertyValue> ?? [])
            .Select(ApiOEmbed.From)
            .ToArray();
}
