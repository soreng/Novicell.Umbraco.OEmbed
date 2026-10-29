using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Extensions;

namespace Novicell.Umbraco.OEmbed.Migrations;

/// <summary>
/// Makes the data types of the Umbraco 9 version work with this version. They keep their editor alias, so
/// existing properties and content keep working; what changes is the editor UI they use and the setting
/// that limits the type, see <see cref="Umbraco9DataTypes"/>.
/// </summary>
/// <remarks>
/// It only touches data types with the editor alias of this package, and a data type that is already in the
/// current shape is left as it is, so it changes nothing on a new site. Content is not touched: a value of
/// the old version is read as it is, and saved in the current shape the next time it is edited.
/// </remarks>
internal sealed class ConvertUmbraco9DataTypes(IMigrationContext context) : AsyncMigrationBase(context)
{
    protected override Task MigrateAsync()
    {
        var dataTypes = Database.Fetch<DataTypeRow>(Sql()
            .Select<DataTypeRow>()
            .From<DataTypeRow>()
            .Where<DataTypeRow>(x => x.EditorAlias == Constants.PropertyEditors.OEmbedPicker));

        var changed = 0;

        foreach (DataTypeRow dataType in dataTypes)
        {
            if (Umbraco9DataTypes.Convert(dataType))
            {
                Database.Update(dataType);
                changed++;
            }
        }

        Logger.LogInformation(
            "oEmbed migration: {DataTypeCount} data types with the editor {EditorAlias}, {ChangedCount} converted",
            dataTypes.Count,
            Constants.PropertyEditors.OEmbedPicker,
            changed);

        return Task.CompletedTask;
    }
}
