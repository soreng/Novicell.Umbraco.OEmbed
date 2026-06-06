using Novicell.OEmbed.Core.Configuration;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.OEmbed.Extensions;

public static class UmbracoBuilderExtensions
{
    /// <summary>
    /// Adds OEmbed services to the Umbraco builder.
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public static IUmbracoBuilder AddNovicellOEmbed(this IUmbracoBuilder builder)
    {
        builder.AddNovicellOEmbedCore();
        builder.AddNovicellOEmbedWeb();

        return builder;
    }
}
