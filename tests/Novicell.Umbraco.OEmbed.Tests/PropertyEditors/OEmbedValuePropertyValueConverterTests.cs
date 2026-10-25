using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Novicell.Umbraco.OEmbed.Tests.PropertyEditors;

[TestFixture]
public class OEmbedValuePropertyValueConverterTests
{
    private OEmbedValuePropertyValueConverter _converter = null!;
    private IPublishedElement _owner = null!;

    [SetUp]
    public void SetUp()
    {
        _converter = new OEmbedValuePropertyValueConverter();
        _owner = Substitute.For<IPublishedElement>();
    }

    private static IPublishedPropertyType PropertyType(string editorAlias)
    {
        IPublishedPropertyType propertyType = Substitute.For<IPublishedPropertyType>();
        propertyType.EditorAlias.Returns(editorAlias);
        return propertyType;
    }

    [Test]
    public void IsConverter_Matches_Only_The_OEmbedPicker_Alias()
    {
        Assert.That(_converter.IsConverter(PropertyType(Constants.PropertyEditors.OEmbedPicker)), Is.True);
        Assert.That(_converter.IsConverter(PropertyType("Umbraco.TextBox")), Is.False);
    }

    [Test]
    public void GetPropertyValueType_Returns_IEnumerable_Of_OEmbedPropertyValue()
    {
        Assert.That(_converter.GetPropertyValueType(PropertyType(Constants.PropertyEditors.OEmbedPicker)),
            Is.EqualTo(typeof(IEnumerable<OEmbedPropertyValue>)));
    }

    [Test]
    public void ConvertSourceToIntermediate_Parses_Valid_Stored_Json_Array()
    {
        const string json = """
            [
                { "url": "https://youtube.com/watch?v=123", "oembed": { "type": "video", "version": "1.0", "title": "A test video" } },
                { "url": "https://youtube.com/watch?v=456", "oembed": { "type": "video", "version": "1.0", "title": "Another video" } }
            ]
            """;

        var result = (_converter.ConvertSourceToIntermediate(_owner, PropertyType(Constants.PropertyEditors.OEmbedPicker), json, false)
            as IEnumerable<OEmbedPropertyValue>)!.ToList();

        Assert.That(result, Has.Count.EqualTo(2));
        Assert.That(result[0].Url, Is.EqualTo("https://youtube.com/watch?v=123"));
        Assert.That(result[0].OEmbed.Type, Is.EqualTo(OEmbedType.Video));
        Assert.That(result[1].OEmbed.Title, Is.EqualTo("Another video"));
    }

    [Test]
    public void ConvertSourceToIntermediate_Wraps_Legacy_Single_Object_Json_In_A_List()
    {
        const string json = """
            {
                "url": "https://youtube.com/watch?v=123",
                "oembed": { "type": "video", "version": "1.0", "title": "A test video" }
            }
            """;

        var result = (_converter.ConvertSourceToIntermediate(_owner, PropertyType(Constants.PropertyEditors.OEmbedPicker), json, false)
            as IEnumerable<OEmbedPropertyValue>)!.ToList();

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].Url, Is.EqualTo("https://youtube.com/watch?v=123"));
        Assert.That(result[0].OEmbed.Title, Is.EqualTo("A test video"));
    }

    [Test]
    public void ConvertSourceToIntermediate_Parses_Real_World_Shape_Without_A_Version_Field()
    {
        // The Management API's OEmbedResponseModel has no "version" field, so it's never present
        // in what actually gets saved. Regression test: OEmbedResponse.Version used to be
        // `required`, which made every real embed fail to deserialize silently.
        const string json = """
            [{ "url": "https://youtube.com/watch?v=123", "oembed": { "type": "video", "width": 200, "height": 113 } }]
            """;

        var result = (_converter.ConvertSourceToIntermediate(_owner, PropertyType(Constants.PropertyEditors.OEmbedPicker), json, false)
            as IEnumerable<OEmbedPropertyValue>)!.ToList();

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].OEmbed.Type, Is.EqualTo(OEmbedType.Video));
    }

    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    [TestCase("{ not valid json")]
    [TestCase("""{"url": "https://youtube.com/watch?v=123"}""")] // missing required "oembed"
    public void ConvertSourceToIntermediate_Returns_Empty_For_Null_Empty_Or_Malformed_Value(string? source)
    {
        var result = _converter.ConvertSourceToIntermediate(_owner, PropertyType(Constants.PropertyEditors.OEmbedPicker), source, false)
            as IEnumerable<OEmbedPropertyValue>;

        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Empty);
    }

    [Test]
    public void ConvertIntermediateToObject_Returns_The_Parsed_Value_Unchanged()
    {
        var value = new List<OEmbedPropertyValue>
        {
            new()
            {
                Url = "https://youtube.com/watch?v=123",
                OEmbed = new OEmbedResponse { Type = OEmbedType.Video, Version = "1.0" }
            }
        };

        var result = _converter.ConvertIntermediateToObject(
            _owner,
            PropertyType(Constants.PropertyEditors.OEmbedPicker),
            global::Umbraco.Cms.Core.PropertyEditors.PropertyCacheLevel.Element,
            value,
            false);

        Assert.That(result, Is.SameAs(value));
    }

    [Test]
    public void ConvertIntermediateToObject_Returns_Null_When_Intermediate_Is_Not_An_OEmbedPropertyValue_Collection()
    {
        var result = _converter.ConvertIntermediateToObject(
            _owner,
            PropertyType(Constants.PropertyEditors.OEmbedPicker),
            global::Umbraco.Cms.Core.PropertyEditors.PropertyCacheLevel.Element,
            null,
            false);

        Assert.That(result, Is.Null);
    }
}
