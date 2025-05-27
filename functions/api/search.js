export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const query = url.searchParams.get('q');
  const page = url.searchParams.get('page') || '1';

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing search query' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query.replace(/\s+/g, '+'))}/${page}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const videos = extractVideosFromHTML(html);

    return new Response(JSON.stringify(videos), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// HTML extraction using matchAll (safer than div block regex)
function extractVideosFromHTML(html) {
  const videos = [];
  const regex = /<a href="(\/video[^"]+)"[^>]*>\s*<div class="thumb[^"]*">[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"[\s\S]*?<p class="metadata">([^<]+)<\/p>/g;

  for (const match of html.matchAll(regex)) {
    const [_, href, thumb, meta] = match;

    let views = null, rating = null, duration = null, quality = null;
    const metaMatch = meta.match(/([\d.]+[MK]?)\s+(\d+%)?\s*(.*?)\s*-\s*(\d+p)/);
    if (metaMatch) {
      views = metaMatch[1];
      rating = metaMatch[2];
      duration = metaMatch[3];
      quality = metaMatch[4];
    }

    videos.push({
      title: meta.trim(),
      url: `https://www.xnxx.com${href}`,
      thumbnail: thumb,
      views,
      rating,
      duration,
      quality,
    });
  }

  return videos;
}
