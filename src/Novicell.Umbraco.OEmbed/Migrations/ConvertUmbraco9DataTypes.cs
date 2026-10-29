using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.OperationStatus;
using Umbraco.Cms.Infrastructure.Migrations;

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
/// The data types are saved through <see cref="IDataTypeService"/>, so Umbraco validates them and refreshes
/// its caches, and no table is written to directly.
/// </remarks>
internal sealed class ConvertUmbraco9DataTypes(IMigrationContext context, IDataTypeService dataTypeService)
    : AsyncMigrationBase(context)
{
    protected override async Task MigrateAsync()
    {
        IEnumerable<IDataType> dataTypes = await dataTypeService.GetByEditorAliasAsync(Constants.PropertyEditors.OEmbedPicker);

        var found = 0;
        var changed = 0;

        foreach (IDataType dataType in dataTypes)
        {
            found++;

            if (!Umbraco9DataTypes.Convert(dataType))
            {
                continue;
            }

            Attempt<IDataType, DataTypeOperationStatus> result =
                await dataTypeService.UpdateAsync(dataType, global::Umbraco.Cms.Core.Constants.Security.SuperUserKey);

            if (result.Success)
            {
                changed++;
            }
            else
            {
                Logger.LogWarning(
                    "oEmbed migration: data type {DataTypeKey} ({DataTypeName}) could not be converted: {Status}",
                    dataType.Key,
                    dataType.Name,
                    result.Status);
            }
        }

        Logger.LogInformation(
            "oEmbed migration: {DataTypeCount} data types with the editor {EditorAlias}, {ChangedCount} converted",
            found,
            Constants.PropertyEditors.OEmbedPicker,
            changed);
    }
}
