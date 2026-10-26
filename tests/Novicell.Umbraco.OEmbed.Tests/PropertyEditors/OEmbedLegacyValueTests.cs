using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Novicell.Umbraco.OEmbed.Tests.PropertyEditors;

/// <summary>
/// Content saved with the Umbraco 9 version of the package. That version stored the oEmbed response
/// with the names of the oEmbed specification (snake_case: author_name, thumbnail_url, ...) as one
/// object, while this version stores camelCase names in an array. A site that still has such content
/// must get the whole value back, not only the fields whose names happen to be the same.
/// </summary>
[TestFixture]
public class OEmbedLegacyValueTests
{
    // Copied from the stored value in the Umbraco 9 package's demo content
    // (Novicell.Umbraco.OEmbed.Website/uSync/v9/Content/home1.config).
    private const string StoredByTheUmbraco9Package = """
        {
          "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "oembed": {
            "type": "video",
            "version": "1.0",
            "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
            "author_name": "Rick Astley",
            "author_url": "https://www.youtube.com/c/RickastleyCoUkOfficial",
            "provider_name": "YouTube",
            "provider_url": "https://www.youtube.com/",
            "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            "thumbnail_height": 360,
            "thumbnail_width": 480,
            "html": "<iframe width=\"200\" height=\"113\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed\" frameborder=\"0\" allowfullscreen></iframe>",
            "url": null,
            "height": 113,
            "width": 200,
            "cache_age": 3600
          }
        }
        """;

    private static List<OEmbedPropertyValue> Convert(string json)
    {
        IPublishedPropertyType propertyType = Substitute.For<IPublishedPropertyType>();
        propertyType.EditorAlias.Returns(Constants.PropertyEditors.OEmbedPicker);

        return ((IEnumerable<OEmbedPropertyValue>)new OEmbedValuePropertyValueConverter()
            .ConvertSourceToIntermediate(Substitute.For<IPublishedElement>(), propertyType, json, false)!).ToList();
    }

    [Test]
    public void A_Value_Stored_By_The_Umbraco_9_Package_Keeps_Every_Field()
    {
        List<OEmbedPropertyValue> result = Convert(StoredByTheUmbraco9Package);

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].Url, Is.EqualTo("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));

        OEmbedResponse response = result[0].OEmbed;
        Assert.That(response.Type, Is.EqualTo(OEmbedType.Video));
        Assert.That(response.Version, Is.EqualTo("1.0"));
        Assert.That(response.Title, Is.EqualTo("Rick Astley - Never Gonna Give You Up (Official Music Video)"));
        Assert.That(response.AuthorName, Is.EqualTo("Rick Astley"));
        Assert.That(response.AuthorUrl, Is.EqualTo(new Uri("https://www.youtube.com/c/RickastleyCoUkOfficial")));
        Assert.That(response.ProviderName, Is.EqualTo("YouTube"));
        Assert.That(response.ProviderUrl, Is.EqualTo(new Uri("https://www.youtube.com/")));
        Assert.That(response.ThumbnailUrl, Is.EqualTo(new Uri("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg")));
        Assert.That(response.ThumbnailHeight, Is.EqualTo(360));
        Assert.That(response.ThumbnailWidth, Is.EqualTo(480));
        Assert.That(response.Width, Is.EqualTo(200));
        Assert.That(response.Height, Is.EqualTo(113));
        Assert.That(response.CacheAge, Is.EqualTo(3600));
        Assert.That(response.Html, Does.StartWith("<iframe"));
    }

    [Test]
    public void The_Camel_Case_Name_Wins_When_Both_Spellings_Are_Present()
    {
        List<OEmbedPropertyValue> result = Convert("""
            { "url": "https://youtube.com/watch?v=1",
              "oembed": { "type": "video", "author_name": "Old", "authorName": "New" } }
            """);

        Assert.That(result[0].OEmbed.AuthorName, Is.EqualTo("New"));
    }

    [Test]
    public void The_Values_In_An_Array_Of_Mixed_Spellings_Are_Each_Read()
    {
        List<OEmbedPropertyValue> result = Convert("""
            [ { "url": "https://youtube.com/watch?v=1", "oembed": { "type": "video", "provider_name": "YouTube" } },
              { "url": "https://vimeo.com/2", "oembed": { "type": "video", "providerName": "Vimeo" } } ]
            """);

        Assert.That(result.Select(r => r.OEmbed.ProviderName), Is.EqualTo(new[] { "YouTube", "Vimeo" }));
    }

    [Test]
    public void A_Legacy_Name_Does_Not_Skip_The_Url_Safety_Check()
    {
        List<OEmbedPropertyValue> result = Convert("""
            { "url": "https://youtube.com/watch?v=1",
              "oembed": { "type": "video", "author_url": "javascript:alert(1)", "thumbnail_url": "data:text/html,x" } }
            """);

        Assert.That(result[0].OEmbed.AuthorUrl, Is.Null);
        Assert.That(result[0].OEmbed.ThumbnailUrl, Is.Null);
    }

    [Test]
    public void Duplicate_Property_Names_Do_Not_Make_The_Converter_Throw()
    {
        Assert.DoesNotThrow(() => Convert("""
            { "url": "https://youtube.com/watch?v=1", "oembed": { "type": "video", "title": "a", "title": "b" } }
            """));
    }
}
