using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Novicell.Umbraco.OEmbed;
using Novicell.Umbraco.OEmbed.Api.Configuration;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.DependencyInjection;

namespace Novicell.Umbraco.OEmbed.Configuration;

public static class WebBuilderExtensions
{
    /// <summary>
    /// Adds Umbraco AI services to the Umbraco builder.
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public static IUmbracoBuilder AddNovicellOEmbedWeb(this IUmbracoBuilder builder)
    {
        builder.AddNovicellOEmbedManagementApi();
        //builder.AddNovicellOEmbedWeb();

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
                    // Contact = new OpenApiContact
                    // {
                    //     Name = "Some Developer",
                    //     Email = "you@company.com",
                    //     Url = new Uri("https://company.com")
                    // }
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

                //options.DocumentFilter<MimeTypeDocumentFilter>(apiName);
                options.OperationFilter<OEmbedApiOperationSecurityFilter>();
                //options.OperationFilter<SwaggerOperationFilter>(apiName);
                //options.OperationFilter<SseResponseOperationFilter>(apiName);

                // // Map IdOrAlias to string in OpenAPI schema for cleaner client generation
                // if (!options.SchemaGeneratorOptions.CustomTypeMappings.ContainsKey(typeof(IdOrAlias)))
                // {
                //     options.MapType<IdOrAlias>(() => new OpenApiSchema { Type = JsonSchemaType.String });
                // }

                // Map System.Type to string in OpenAPI schema (JsonStringTypeConverter handles serialization)
                if (!options.SchemaGeneratorOptions.CustomTypeMappings.ContainsKey(typeof(Type)))
                {
                    options.MapType<Type>(() => new OpenApiSchema { Type = JsonSchemaType.String });
                }
            });
        }

        builder.Services.AddSingleton<IOperationIdHandler, OEmbedApiOperationIdHandler>();

        return builder;

    }
}
