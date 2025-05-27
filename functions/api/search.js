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
    const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query.replace(' ', '+'))}/${page}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
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
  const thumbBlockRegex = /<div class="thumb-block"[\s\S]*?>([\s\S]*?)<\/div>/g;
  const thumbBlocks = html.match(thumbBlockRegex) || [];

  for (const block of thumbBlocks) {
    const linkMatch = block.match(/<a href="([^"]+)"[^>]*>/);
    const link = linkMatch ? `https://www.xnxx.com${linkMatch[1]}` : null;

    const thumbMatch = block.match(/<img[^>]+(?:data-src|src)="([^"]+)"/);
    const thumb = thumbMatch ? thumbMatch[1] : null;

    const metadataMatch = block.match(/<p class="metadata">([\s\S]*?)<\/p>/);
    const metadata = metadataMatch ? metadataMatch[1].replace(/\s+/g, ' ').trim() : '';

    const metadataRegex = /([\d\.]+[MK]?)\s*(\d+%)\s*([\w\s]+?)\s*-\s*(\d+p)/;
    const match = metadata.match(metadataRegex);
    const [views, rating, duration, quality] = match
      ? [match[1], match[2], match[3], match[4]]
      : [null, null, null, null];

    if (link) {
      videos.push({
        title: metadata,
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
