using Microsoft.Extensions.DependencyInjection;
using Novicell.OEmbed.Configuration;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extension1.Controllers;
using Umbraco.Extension1.Services;

namespace Novicell.OEmbed.Extensions;

public static class UmbracoBuilderExtensions
{
    internal static IUmbracoBuilder AddNovicellOEmbedCore(this IUmbracoBuilder builder)
    {
        var services = builder.Services;
        var config = builder.Config;
        
        services.AddTransient<IOEmbedApiEndpointProvider, OEmbedApiEndpointProvider>();
        services.AddTransient<IOEmbedApiEndpointDiscoveryProvider, OEmbedApiEndpointDiscoveryProvider>();
        services.AddTransient<IOEmbedService, OEmbedService>();
        services.AddOptions<OEmbedOptions>()
            .Bind(config.GetSection(OEmbedOptions.SectionKey));
        

        return builder;
    }
}