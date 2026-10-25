using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Novicell.Umbraco.OEmbed.Configuration;
using Novicell.Umbraco.OEmbed.Core.OEmbed;
using Novicell.Umbraco.OEmbed.Core.OEmbed.EmbedProviders;
using Novicell.Umbraco.OEmbed.Core.PropertyEditors;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Core.Configuration;

public static class UmbracoBuilderExtensions
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
