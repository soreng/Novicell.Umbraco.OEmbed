using System.Text;

namespace Novicell.Umbraco.OEmbed.Services;

/// <summary>
/// The limits for HTTP calls made on behalf of an editor: to an oEmbed endpoint, and (with
/// Autodiscover) to the page an editor pasted. Both can be an arbitrary host, so every call gets
/// the same bounds on time, redirects and response size.
/// </summary>
internal static class OEmbedHttp
{
    /// <summary>The name of the <see cref="HttpClient"/> used for all oEmbed traffic.</summary>
    internal const string ClientName = "Novicell.Umbraco.OEmbed";

    internal const int MaxRedirects = 3;

    internal const long MaxResponseBytes = 1024 * 1024;

    internal static readonly TimeSpan Timeout = TimeSpan.FromSeconds(10);

    /// <summary>True for an absolute http or https URI. Anything else is never requested.</summary>
    internal static bool IsHttpUrl(Uri? uri)
        => uri is { IsAbsoluteUri: true }
           && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    /// <summary>
    /// Opens the response body, failing if it is larger than <see cref="MaxResponseBytes"/>. The
    /// declared length is checked first, and the bytes actually read are counted, because a
    /// server can omit or misstate the length.
    /// </summary>
    internal static async Task<Stream> ReadLimitedStreamAsync(HttpContent content, CancellationToken cancellationToken)
    {
        if (content.Headers.ContentLength > MaxResponseBytes)
        {
            throw new ResponseTooLargeException();
        }

        Stream stream = await content.ReadAsStreamAsync(cancellationToken);

        return new LimitedReadStream(stream, MaxResponseBytes);
    }

    /// <summary>Reads the response body as text (UTF-8), failing if it is larger than the limit.</summary>
    internal static async Task<string> ReadLimitedStringAsync(HttpContent content, CancellationToken cancellationToken)
    {
        await using Stream stream = await ReadLimitedStreamAsync(content, cancellationToken);
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);

        return await reader.ReadToEndAsync(cancellationToken);
    }

    /// <summary>Thrown when a response is larger than <see cref="MaxResponseBytes"/>.</summary>
    internal sealed class ResponseTooLargeException()
        : IOException($"The response is larger than {MaxResponseBytes} bytes.");

    /// <summary>A read-only stream that throws once more than <c>limit</c> bytes have been read.</summary>
    private sealed class LimitedReadStream(Stream inner, long limit) : Stream
    {
        private long _read;

        public override bool CanRead => true;

        public override bool CanSeek => false;

        public override bool CanWrite => false;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        public override int Read(byte[] buffer, int offset, int count)
            => Count(inner.Read(buffer, offset, count));

        public override int Read(Span<byte> buffer)
            => Count(inner.Read(buffer));

        public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
            => Count(await inner.ReadAsync(buffer, cancellationToken));

        public override async Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
            => Count(await inner.ReadAsync(buffer.AsMemory(offset, count), cancellationToken));

        public override void Flush()
        {
        }

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                inner.Dispose();
            }

            base.Dispose(disposing);
        }

        public override async ValueTask DisposeAsync()
        {
            await inner.DisposeAsync();
            await base.DisposeAsync();
        }

        private int Count(int bytesRead)
        {
            _read += bytesRead;

            return _read > limit ? throw new ResponseTooLargeException() : bytesRead;
        }
    }
}
