export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/search')) {
      const query = url.searchParams.get('q');
      const page = url.searchParams.get('page') || 1;
      return new Response(await handleSearch(query, page), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (path.startsWith('/api/video')) {
      const videoUrl = url.searchParams.get('url');
      if (!videoUrl || !videoUrl.includes('xnxx.com')) {
        return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400 });
      }
      return new Response(await handleVideo(videoUrl), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  },
};

async function handleSearch(query, page) {
  const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`;
  const res = await fetch(searchUrl);
  const html = await res.text();

  const regex = /<div class="thumb">\\s*<a href="([^"]+)"[^>]*>\\s*<img src="([^"]+)"[^>]*alt="([^"]*)"/g;
  let match;
  const results = [];

  while ((match = regex.exec(html)) !== null) {
    results.push({
      url: 'https://www.xnxx.com' + match[1],
      thumbnail: match[2],
      title: match[3]
    });
  }

  return JSON.stringify({ query, page, results });
}

async function handleVideo(videoPageUrl) {
  const res = await fetch(videoPageUrl);
  const html = await res.text();

  const low = html.match(/setVideoUrlLow\\('([^']+)'\\)/);
  const high = html.match(/setVideoUrlHigh\\('([^']+)'\\)/);
  const hq = html.match(/setVideoUrlHLS\\('([^']+)'\\)/);
  const title = html.match(/<title>(.*?) - XNXX.COM<\\/title>/);

  return JSON.stringify({
    url: videoPageUrl,
    title: title ? title[1] : null,
    low_quality: low ? low[1] : null,
    high_quality: high ? high[1] : null,
    hls_stream: hq ? hq[1] : null
  });
}
