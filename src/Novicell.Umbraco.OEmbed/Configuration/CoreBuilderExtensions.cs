using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.Services;
using Novicell.Umbraco.OEmbed.EmbedProviders;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Configuration;

public static class CoreBuilderExtensions
{
    internal static IUmbracoBuilder AddNovicellOEmbedCore(this IUmbracoBuilder builder)
    {
        IServiceCollection services = builder.Services;
        IConfiguration config = builder.Config;

        services.AddTransient<IOEmbedApiEndpointProvider, OEmbedApiEndpointProvider>();
        services.AddTransient<IOEmbedApiEndpointDiscoveryProvider, OEmbedApiEndpointDiscoveryProvider>();
        services.AddTransient<IOEmbedService, OEmbedService>();
        services.AddOptions<OEmbedOptions>()
            .Bind(config.GetSection(OEmbedOptions.SectionKey));

        builder.PropertyValueConverters().Append<OEmbedValuePropertyValueConverter>();

        builder.EmbedProviders()
            .Append<Reddit>()
            .Append<Spotify>()
            .Append<TikTok>();

        return builder;
    }
}
