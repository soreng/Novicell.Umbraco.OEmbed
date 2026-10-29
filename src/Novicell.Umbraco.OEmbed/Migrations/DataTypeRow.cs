using NPoco;

// Umbraco's own DTO for this table is internal, so the migration maps the few columns it needs itself.
namespace Novicell.Umbraco.OEmbed.Migrations;

[TableName("umbracoDataType")]
[PrimaryKey("nodeId", AutoIncrement = false)]
[ExplicitColumns]
internal sealed class DataTypeRow
{
    [Column("nodeId")]
    public int NodeId { get; set; }

    [Column("propertyEditorAlias")]
    public string EditorAlias { get; set; } = string.Empty;

    [Column("propertyEditorUiAlias")]
    public string? EditorUiAlias { get; set; }

    [Column("dbType")]
    public string DbType { get; set; } = string.Empty;

    [Column("config")]
    public string? Configuration { get; set; }
}
