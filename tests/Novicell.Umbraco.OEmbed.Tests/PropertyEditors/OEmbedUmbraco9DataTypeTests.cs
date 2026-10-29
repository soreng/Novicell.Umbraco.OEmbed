using Novicell.Umbraco.OEmbed.Migrations;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using NUnit.Framework;
using Umbraco.Cms.Core.PropertyEditors;

namespace Novicell.Umbraco.OEmbed.Tests.PropertyEditors;

/// <summary>
/// The editor keeps the alias of the Umbraco 9 version, so its data types and properties keep working. The
/// migration gives those data types the editor UI and the setting they need in this version.
/// </summary>
[TestFixture]
public class OEmbedUmbraco9DataTypeTests
{
    private const string OldUiAliasFallback = "Novicell.OEmbed";

    private static DataTypeRow Row(string? uiAlias, string? configuration) => new()
    {
        NodeId = 1,
        EditorAlias = Constants.PropertyEditors.OEmbedPicker,
        EditorUiAlias = uiAlias,
        DbType = "Ntext",
        Configuration = configuration,
    };

    [Test]
    public void The_Alias_Is_The_One_Of_The_Umbraco_9_Version()
    {
        // Data types and properties are saved with this alias, so changing it breaks every site that has them.
        Assert.That(Constants.PropertyEditors.OEmbedPicker, Is.EqualTo("Novicell.OEmbed"));
        Assert.That(
            typeof(OEmbedPickerPropertyEditor).GetCustomAttributes(typeof(DataEditorAttribute), inherit: false)
                .Cast<DataEditorAttribute>().Single().Alias,
            Is.EqualTo("Novicell.OEmbed"));
    }

    [TestCase("""{"Type":"Video"}""", """{"allowedTypes":["video"]}""")]
    [TestCase("""{"Type":"Photo"}""", """{"allowedTypes":["photo"]}""")]
    [TestCase("""{"Type":"Rich"}""", """{"allowedTypes":["rich"]}""")]
    [TestCase("""{"Type":"Link"}""", """{"allowedTypes":["link"]}""")]
    [TestCase("""{ "type": "video" }""", """{"allowedTypes":["video"]}""")]
    [TestCase("""{"Type":""}""", """{"allowedTypes":[]}""")]
    [TestCase("""{"Type":null}""", """{"allowedTypes":[]}""")]
    [TestCase("""{"Type":3}""", """{"allowedTypes":[]}""")]
    [TestCase("""{"Type":"movie"}""", """{"allowedTypes":[]}""")]
    public void The_Type_Setting_Becomes_The_Allowed_Types(string stored, string expected)
    {
        DataTypeRow row = Row("Novicell.PropertyEditorUi.OEmbedPicker", stored);

        Assert.That(Umbraco9DataTypes.Convert(row), Is.True);
        Assert.That(row.Configuration, Is.EqualTo(expected));
    }

    [TestCase(null)]
    [TestCase("")]
    [TestCase(OldUiAliasFallback)]
    public void A_Data_Type_Without_An_Editor_UI_Gets_Ours(string? uiAlias)
    {
        DataTypeRow row = Row(uiAlias, """{"allowedTypes":["video"]}""");

        Assert.That(Umbraco9DataTypes.Convert(row), Is.True);
        Assert.That(row.EditorUiAlias, Is.EqualTo("Novicell.PropertyEditorUi.OEmbedPicker"));
        Assert.That(row.Configuration, Is.EqualTo("""{"allowedTypes":["video"]}"""), "the configuration is already in the current shape");
    }

    [Test]
    public void An_Editor_UI_That_Was_Chosen_Is_Not_Replaced()
    {
        DataTypeRow row = Row("Some.Other.PropertyEditorUi", """{"Type":"Video"}""");

        Umbraco9DataTypes.Convert(row);

        Assert.That(row.EditorUiAlias, Is.EqualTo("Some.Other.PropertyEditorUi"));
        Assert.That(row.Configuration, Is.EqualTo("""{"allowedTypes":["video"]}"""));
    }

    [Test]
    public void A_Data_Type_From_The_Old_Version_Is_Converted_Once()
    {
        DataTypeRow row = Row(null, """{"Type":"Video"}""");

        Assert.That(Umbraco9DataTypes.Convert(row), Is.True);
        Assert.That(Umbraco9DataTypes.Convert(row), Is.False, "nothing is left to convert");
        Assert.That(row.EditorUiAlias, Is.EqualTo("Novicell.PropertyEditorUi.OEmbedPicker"));
        Assert.That(row.Configuration, Is.EqualTo("""{"allowedTypes":["video"]}"""));
    }

    [TestCase("""{"allowedTypes":["video","rich"],"multiple":true,"validationLimit":{"min":1,"max":3}}""")]
    [TestCase("""{"Type":"Video","allowedTypes":["photo"],"multiple":false}""")]
    [TestCase("""{}""")]
    [TestCase("""[]""")]
    [TestCase("not json")]
    [TestCase("")]
    [TestCase(null)]
    public void A_Data_Type_In_The_Current_Shape_Is_Left_As_It_Is(string? configuration)
    {
        DataTypeRow row = Row("Novicell.PropertyEditorUi.OEmbedPicker", configuration);

        Assert.That(Umbraco9DataTypes.Convert(row), Is.False);
        Assert.That(row.Configuration, Is.EqualTo(configuration));
        Assert.That(row.EditorUiAlias, Is.EqualTo("Novicell.PropertyEditorUi.OEmbedPicker"));
    }

    [Test]
    public void The_Editor_UI_Alias_Is_The_One_In_The_Client_Manifest()
    {
        // A different alias here would point the migrated data types at an editor UI that does not exist.
        var manifest = File.ReadAllText(Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "..", "..",
            "src", "Novicell.Umbraco.OEmbed", "Client", "src", "property-editors", "oembed-picker", "manifests.ts"));

        Assert.That(manifest, Does.Contain($"alias: '{Umbraco9DataTypes.EditorUiAlias}'"));
    }
}
