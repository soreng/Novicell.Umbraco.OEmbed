using Novicell.Umbraco.OEmbed.Extensions;
using Novicell.Umbraco.OEmbed.Core.PropertyEditors;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Startup.Configuration;

/// <inheritdoc />
public class OEmbedComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.DataEditors().Add<OEmbedDataEditor>();
        builder.AddNovicellOEmbed();
    }
}
