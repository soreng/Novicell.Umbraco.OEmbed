using System.Text.Json;
using System.Text.Json.Nodes;
using Novicell.Umbraco.OEmbed.Api.Models;
using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using Novicell.Umbraco.OEmbed.Tests.TestSupport;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Editors;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Novicell.Umbraco.OEmbed.Tests.PropertyEditors;

/// <summary>
/// The database has the names of the oEmbed specification (author_name, thumbnail_url, ...), as the
/// providers return them. The backoffice works with camelCase, like the Management API it gets the response
/// from. <see cref="OEmbedDataValueEditor"/> converts between the two when a value is saved and loaded.
/// </summary>
[TestFixture]
public class OEmbedStoredNamesTests
{
    private const string FromTheBackoffice = """
        [{ "url": "https://www.youtube.com/watch?v=1",
           "oembed": { "type": "video", "version": "1.0", "title": "A title", "html": "<iframe></iframe>",
                       "authorName": "An author", "authorUrl": "https://www.youtube.com/@a",
                       "providerName": "YouTube", "providerUrl": "https://www.youtube.com/",
                       "thumbnailUrl": "https://i.ytimg.com/vi/1/hq.jpg", "thumbnailWidth": 480,
                       "thumbnailHeight": 360, "cacheAge": 3600, "width": 200, "height": 113 } }]
        """;

    private static readonly string[] StoredNames =
    [
        "author_name", "author_url", "provider_name", "provider_url",
        "thumbnail_url", "thumbnail_width", "thumbnail_height", "cache_age",
    ];

    private static readonly string[] EditorNames =
    [
        "authorName", "authorUrl", "providerName", "providerUrl",
        "thumbnailUrl", "thumbnailWidth", "thumbnailHeight", "cacheAge",
    ];

    private static OEmbedDataValueEditor Editor()
    {
        ILocalizedTextService text = Substitute.For<ILocalizedTextService>();
        text.Localize(Arg.Any<string?>(), Arg.Any<string?>(), Arg.Any<System.Globalization.CultureInfo?>(), Arg.Any<IDictionary<string, string?>?>())
            .Returns("localized message");

        return new OEmbedDataValueEditor(
            Substitute.For<IShortStringHelper>(),
            TestJsonSerializer.Create(),
            Substitute.For<IIOHelper>(),
            new DataEditorAttribute(Constants.PropertyEditors.OEmbedPicker) { ValueType = ValueTypes.Json },
            text);
    }

    private static JsonObject OEmbedOf(object? value)
    {
        JsonNode node = value is string json ? JsonNode.Parse(json)! : (JsonNode)value!;
        return node.AsArray()[0]!["oembed"]!.AsObject();
    }

    [Test]
    public void The_Management_Api_Response_Uses_CamelCase_Names()
    {
        var model = new OEmbedResponseModel(OEmbedType.Video, "1.0", 200, 113, null, null, "t", null, "a", null, "p", null, 480, 360, 3600);

        JsonObject json = JsonNode.Parse(JsonSerializer.Serialize(model, new JsonSerializerOptions(JsonSerializerDefaults.Web)))!.AsObject();

        Assert.That(json.Select(p => p.Key), Is.SupersetOf(EditorNames));
        Assert.That(json.Select(p => p.Key), Has.None.Matches<string>(k => k.Contains('_')));
    }

    [Test]
    public void A_Value_Is_Saved_With_The_Names_Of_The_oEmbed_Specification()
    {
        // The Management API hands the editor a JsonArray.
        object? saved = Editor().FromEditor(new ContentPropertyData(JsonNode.Parse(FromTheBackoffice), null), null);

        JsonObject oembed = OEmbedOf(saved);
        Assert.That(oembed.Select(p => p.Key), Is.SupersetOf(StoredNames));
        Assert.That(oembed.Select(p => p.Key), Has.None.AnyOf(EditorNames));
        Assert.That((string?)oembed["author_name"], Is.EqualTo("An author"));
        Assert.That((int?)oembed["thumbnail_width"], Is.EqualTo(480));
        Assert.That((int?)oembed["cache_age"], Is.EqualTo(3600));
    }

    [Test]
    public void A_Value_Is_Saved_With_The_Same_Names_When_The_Editor_Hands_Over_A_String()
    {
        object? saved = Editor().FromEditor(new ContentPropertyData(FromTheBackoffice, null), null);

        Assert.That(OEmbedOf(saved).Select(p => p.Key), Is.SupersetOf(StoredNames));
    }

    [Test]
    public void A_Stored_Value_Is_Loaded_With_CamelCase_Names()
    {
        IProperty property = Substitute.For<IProperty>();
        property.GetValue(Arg.Any<string?>(), Arg.Any<string?>(), Arg.Any<bool>()).Returns(StoredValues.Current);

        JsonObject oembed = OEmbedOf(Editor().ToEditor(property));
        Assert.That(oembed.Select(p => p.Key), Is.SupersetOf(EditorNames));
        Assert.That(oembed.Select(p => p.Key), Has.None.AnyOf(StoredNames));
        Assert.That((string?)oembed["providerName"], Is.EqualTo("YouTube"));
    }

    [Test]
    public void A_Value_Stored_By_The_Umbraco_9_Package_Is_Loaded_With_CamelCase_Names()
    {
        IProperty property = Substitute.For<IProperty>();
        property.GetValue(Arg.Any<string?>(), Arg.Any<string?>(), Arg.Any<bool>()).Returns(StoredValues.Umbraco9);

        // One object, as that version stored it: the names inside are converted all the same.
        object? loaded = Editor().ToEditor(property);
        JsonNode node = loaded is string json ? JsonNode.Parse(json)! : (JsonNode)loaded!;
        JsonObject oembed = (node is JsonArray array ? array[0]! : node)["oembed"]!.AsObject();

        Assert.That(oembed.Select(p => p.Key), Is.SupersetOf(EditorNames));
        Assert.That((string?)oembed["authorName"], Is.EqualTo("Rick Astley"));
    }

    [TestCase("authorUrl", "javascript:alert(1)")]
    [TestCase("providerUrl", "data:text/html,x")]
    [TestCase("thumbnailUrl", "\u0001javascript:alert(1)")]
    public void What_The_Backoffice_Posts_Is_Validated_With_Its_CamelCase_Names(string field, string unsafeUrl)
    {
        JsonNode posted = JsonNode.Parse(FromTheBackoffice)!;
        posted.AsArray()[0]!["oembed"]![field] = unsafeUrl;

        var results = Editor().Validators
            .SelectMany(v => v.Validate(posted, ValueTypes.Json, new OEmbedPickerConfiguration { Multiple = true }, PropertyValidationContext.Empty()))
            .ToList();

        Assert.That(results, Is.Not.Empty, field);
    }

    [Test]
    public void An_Ordinary_Value_Posted_By_The_Backoffice_Is_Valid()
    {
        var results = Editor().Validators
            .SelectMany(v => v.Validate(JsonNode.Parse(FromTheBackoffice), ValueTypes.Json, new OEmbedPickerConfiguration { Multiple = true }, PropertyValidationContext.Empty()))
            .ToList();

        Assert.That(results, Is.Empty);
    }

    [Test]
    public void What_Is_Saved_Is_Read_Back_With_Every_Field()
    {
        object? saved = Editor().FromEditor(new ContentPropertyData(JsonNode.Parse(FromTheBackoffice), null), null);
        var stored = saved as string ?? JsonSerializer.Serialize(saved);

        ConvertWithTheConverter(stored, out OEmbedValue response);

        Assert.That(response.Version, Is.EqualTo("1.0"));
        Assert.That(response.AuthorName, Is.EqualTo("An author"));
        Assert.That(response.AuthorUrl, Is.EqualTo(new Uri("https://www.youtube.com/@a")));
        Assert.That(response.ProviderName, Is.EqualTo("YouTube"));
        Assert.That(response.ThumbnailUrl, Is.EqualTo(new Uri("https://i.ytimg.com/vi/1/hq.jpg")));
        Assert.That(response.ThumbnailWidth, Is.EqualTo(480));
        Assert.That(response.CacheAge, Is.EqualTo(3600));
    }

    [Test]
    public void The_Stored_Value_Has_The_Same_Fields_As_What_A_Provider_Returns()
    {
        // They are separate types on purpose, so a change in how providers are parsed cannot change the
        // stored value, but the backoffice stores what the provider returned, so they must not drift.
        static IEnumerable<string> Names(Type type) => type.GetProperties().Select(p => p.Name).OrderBy(n => n);

        Assert.That(Names(typeof(OEmbedValue)), Is.EqualTo(Names(typeof(OEmbedResponse))));
    }

    [Test]
    public void The_Stored_Value_Is_Written_With_The_Names_Of_The_oEmbed_Specification()
    {
        var value = new OEmbedValue { Type = OEmbedType.Video, AuthorName = "a", ThumbnailWidth = 1, CacheAge = 2 };

        JsonObject json = JsonNode.Parse(JsonSerializer.Serialize(value))!.AsObject();

        Assert.That(json.Select(p => p.Key), Is.SupersetOf(StoredNames));
    }

    [Test]
    public void Values_That_Are_Not_Json_Are_Left_Alone()
    {
        Assert.That(OEmbedJsonNames.ToStored("not json"), Is.EqualTo("not json"));
        Assert.That(OEmbedJsonNames.ToStored(null), Is.Null);
        Assert.That(OEmbedJsonNames.ToEditor(""), Is.EqualTo(""));
    }

    [Test]
    public void The_Name_Already_In_The_Target_Spelling_Wins()
    {
        var result = (string)OEmbedJsonNames.ToStored("""[{ "url": "https://a.test", "oembed": { "authorName": "Editor", "author_name": "Stored" } }]""")!;

        Assert.That((string?)OEmbedOf(result)["author_name"], Is.EqualTo("Stored"));
    }

    private static void ConvertWithTheConverter(string stored, out OEmbedValue response)
    {
        IPublishedPropertyType propertyType = Substitute.For<IPublishedPropertyType>();
        propertyType.EditorAlias.Returns(Constants.PropertyEditors.OEmbedPicker);

        response = ((IEnumerable<OEmbedPropertyValue>)new OEmbedPropertyValueConverter()
            .ConvertSourceToIntermediate(Substitute.For<IPublishedElement>(), propertyType, stored, false)!)
            .Single().OEmbed;
    }
}
