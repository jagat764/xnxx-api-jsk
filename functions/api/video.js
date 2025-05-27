export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const videoPageUrl = url.searchParams.get('url');

  if (!videoPageUrl) {
    return new Response(JSON.stringify({ error: 'Missing URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const response = await fetch(videoPageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const videoUrl = extractVideoUrl(html);

    if (videoUrl) {
      return new Response(JSON.stringify({ url: videoUrl }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Video URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Try multiple patterns for compatibility
function extractVideoUrl(html) {
  const highRes = html.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/);
  if (highRes) return highRes[1];

  const hls = html.match(/html5player\.setVideoHLS\('([^']+)'\)/);
  if (hls) return hls[1];

  const lowRes = html.match(/html5player\.setVideoUrlLow\('([^']+)'\)/);
  if (lowRes) return lowRes[1];

  return null;
}
