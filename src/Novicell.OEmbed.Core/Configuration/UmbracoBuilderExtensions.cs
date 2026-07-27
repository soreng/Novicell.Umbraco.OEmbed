using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Novicell.OEmbed.Configuration;
using Novicell.OEmbed.Core.OEmbed;
using Novicell.OEmbed.Core.OEmbed.EmbedProviders;
using Novicell.OEmbed.Core.PropertyEditors;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.OEmbed.Core.Configuration;

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
