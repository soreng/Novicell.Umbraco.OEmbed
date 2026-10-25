using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Novicell.Umbraco.OEmbed.Api.Configuration;
using Novicell.Umbraco.OEmbed.EmbedProviders;
using Novicell.Umbraco.OEmbed.Models;
using Novicell.Umbraco.OEmbed.PropertyEditors;
using Novicell.Umbraco.OEmbed.Services;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Configuration;

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

    private static IUmbracoBuilder AddNovicellOEmbedCore(this IUmbracoBuilder builder)
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

    /// <summary>
    /// Adds the OEmbed Management API to the Umbraco builder.
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public static IUmbracoBuilder AddNovicellOEmbedWeb(this IUmbracoBuilder builder)
    {
        builder.AddNovicellOEmbedManagementApi();

        return builder;
    }

    private static IUmbracoBuilder AddNovicellOEmbedManagementApi(this IUmbracoBuilder builder)
    {
        builder.WithNovicellOEmbedManagementApi(Constants.ApiName, options =>
        {
            options.SwaggerDoc(
                Constants.ApiName,
                new OpenApiInfo
                {
                    Title = "Novicell OEmbed API",
                    Version = "1.0",
                });
        });

        return builder;
    }

    public static IUmbracoBuilder WithNovicellOEmbedManagementApi(this IUmbracoBuilder builder, string apiName,
        Action<SwaggerGenOptions>? configureSwagger = null)
    {
        if (configureSwagger != null)
        {
            builder.Services.Configure<SwaggerGenOptions>(options =>
            {
                // Only add the swagger doc if it hasn't been added already
                if (options.SwaggerGeneratorOptions.SwaggerDocs.ContainsKey(apiName))
                {
                    return;
                }

                configureSwagger(options);

                options.OperationFilter<OEmbedApiOperationSecurityFilter>();
            });
        }

        builder.Services.AddSingleton<IOperationIdHandler, OEmbedApiOperationIdHandler>();

        return builder;
    }
}
