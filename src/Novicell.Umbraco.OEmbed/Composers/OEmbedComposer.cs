using Novicell.Umbraco.OEmbed.Configuration;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Composers;

/// <inheritdoc />
public class OEmbedComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.DataEditors().Add<OEmbedPickerPropertyEditor>();
        builder.AddNovicellOEmbed();
    }
}
