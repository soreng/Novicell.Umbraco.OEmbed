using Novicell.OEmbed.Extensions;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.OEmbed.Startup.Configuration;

/// <inheritdoc />
public class OEmbedComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNovicellOEmbed();
    }
}