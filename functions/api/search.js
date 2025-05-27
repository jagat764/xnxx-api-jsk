export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    const videos = parseSearchResults(html);

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

function parseSearchResults(html) {
  const videos = [];
  const regex = /<div class="thumb-block.*?">([\s\S]*?)<\/div>\s*<\/div>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const block = match[1];

    const linkMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*>/);
    const link = linkMatch ? `https://www.xnxx.com${linkMatch[1]}` : null;

    const thumbMatch = block.match(/<img[^>]+(?:data-src|src)="([^"]+)"/);
    const thumb = thumbMatch ? thumbMatch[1] : null;

    const titleMatch = block.match(/<p class="metadata">([\s\S]*?)<\/p>/);
    const titleRaw = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    let views = null, rating = null, duration = null, quality = null;
    const metaRegex = /([\d\.]+[MK]?)\s*(\d+%)?\s*(.*?)\s*-\s*(\d+p)/;
    const metaMatch = titleRaw.match(metaRegex);
    if (metaMatch) {
      views = metaMatch[1];
      rating = metaMatch[2];
      duration = metaMatch[3];
      quality = metaMatch[4];
    }

    if (link) {
      videos.push({
        title: titleRaw,
        url: link,
        thumbnail: thumb,
        views,
        rating,
        duration,
        quality,
      });
    }
  }

  return videos;
}
