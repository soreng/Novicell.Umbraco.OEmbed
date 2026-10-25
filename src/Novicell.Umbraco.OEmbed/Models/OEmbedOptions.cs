namespace Novicell.Umbraco.OEmbed.Models;

public class OEmbedOptions
{
    internal const string SectionKey = nameof(Novicell) + ":" + nameof(OEmbed);

    public bool Autodiscover { get; set; }
}
