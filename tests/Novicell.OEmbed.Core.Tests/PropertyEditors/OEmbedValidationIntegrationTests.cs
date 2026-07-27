using System.Text.Json;
using System.Text.Json.Nodes;
using Novicell.OEmbed.Core.Models;
using Novicell.OEmbed.Core.PropertyEditors;
using Novicell.OEmbed.Core.Tests.TestSupport;
using NSubstitute;
using NUnit.Framework;
using Umbraco.Cms.Core.Models.Validation;
using Umbraco.Cms.Core.PropertyEditors.Validation;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

namespace Novicell.OEmbed.Core.Tests.PropertyEditors;

/// <summary>
/// Exercises <see cref="OEmbedMinMaxValidator"/>/<see cref="OEmbedAllowedTypeValidator"/> the way
/// <see cref="OEmbedDataValueEditor"/> actually wires them up - through the real
/// <see cref="TypedJsonValidatorRunner{TValue,TConfiguration}"/> and a real <see cref="IJsonSerializer"/>,
/// mirroring <c>MediaPicker3PropertyValueEditor</c>'s own constructor exactly, with no extra normalization.
/// </summary>
[TestFixture]
public class OEmbedValidationIntegrationTests
{
    private IJsonSerializer _jsonSerializer = null!;
    private ILocalizedTextService _localizedTextService = null!;

    [SetUp]
    public void SetUp()
    {
        _jsonSerializer = TestJsonSerializer.Create();
        _localizedTextService = Substitute.For<ILocalizedTextService>();
        _localizedTextService
            .Localize(Arg.Any<string?>(), Arg.Any<string?>(), Arg.Any<System.Globalization.CultureInfo?>(), Arg.Any<IDictionary<string, string?>?>())
            .Returns("localized message");
    }

    private TypedJsonValidatorRunner<List<OEmbedPropertyValue>, OEmbedPickerConfiguration> BuildRunner()
        => new(
            _jsonSerializer,
            new OEmbedMinMaxValidator(_localizedTextService),
            new OEmbedAllowedTypeValidator(_localizedTextService));

    private static PropertyValidationContext Context() => PropertyValidationContext.Empty();

    private const string OneEmbed = """
        [{ "url": "https://youtube.com/watch?v=1", "oembed": { "type": "video", "version": "1.0" } }]
        """;

    [Test]
    public void Array_Shaped_JsonNode_Value_Is_Validated()
    {
        // This is the shape the Management API's JsonObjectConverter actually produces for a posted
        // array value on a real publish request (a JsonArray, not a bare JsonElement) - confirmed by
        // tracing ConfigureUmbracoBackofficeJsonOptions/JsonObjectConverter.
        JsonNode? value = JsonNode.Parse(OneEmbed);

        var results = BuildRunner().Validate(value, null, new OEmbedPickerConfiguration
        {
            Multiple = true,
            ValidationLimit = new OEmbedPickerConfiguration.NumberRange { Min = 2 },
        }, Context());

        Assert.That(results, Is.Not.Empty);
    }

    [Test]
    public void Array_Shaped_Json_String_Value_Is_Validated()
    {
        // The published-cache/storage shape (a raw JSON string) is also handled directly by
        // IJsonSerializer.TryDeserialize, with no normalization needed.
        var results = BuildRunner().Validate(OneEmbed, null, new OEmbedPickerConfiguration
        {
            Multiple = true,
            ValidationLimit = new OEmbedPickerConfiguration.NumberRange { Min = 2 },
        }, Context());

        Assert.That(results, Is.Not.Empty);
    }

    [Test]
    public void Legacy_Single_Object_Json_Throws_Like_Media_Picker_3_Would_For_An_Equivalent_Shape()
    {
        // Known, accepted limitation: Umbraco's own TypedJsonValidatorRunner/IJsonSerializer.TryDeserialize
        // has no tolerance for a bare JSON object where a JSON array is expected - the same class Media
        // Picker 3 relies on, unwrapped (MediaPicker3PropertyValueEditor's constructor adds it directly to
        // Validators with no normalization either). This project's now-retired OEmbedPropertyValueJson
        // helper used to paper over this for legacy single-object content saved before multi-value support,
        // but we've deliberately chosen to match Media Picker 3's own risk profile here instead of keeping a
        // bespoke wrapper around Umbraco's shared validation infrastructure.
        const string legacySingleObject = """
            { "url": "https://youtube.com/watch?v=1", "oembed": { "type": "video", "version": "1.0" } }
            """;

        Assert.Throws<JsonException>(() => BuildRunner().Validate(legacySingleObject, null, new OEmbedPickerConfiguration
        {
            Multiple = true,
            ValidationLimit = new OEmbedPickerConfiguration.NumberRange { Min = 1 },
        }, Context()));
    }

    [Test]
    public void Allowed_Type_Check_Runs_Through_The_Real_Runner()
    {
        const string disallowed = """
            [{ "url": "https://flickr.com/photo/1", "oembed": { "type": "photo", "version": "1.0" } }]
            """;

        var results = BuildRunner().Validate(disallowed, null, new OEmbedPickerConfiguration
        {
            Multiple = true,
            AllowedTypes = ["video"],
        }, Context());

        Assert.That(results, Is.Not.Empty);
    }
}
