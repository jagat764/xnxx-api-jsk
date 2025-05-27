export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
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

// Extract video URL from video page
function extractVideoUrl(html) {
  const scriptRegex = /html5player\.setVideoUrlHigh\('([^']+)'\)/;
  const scriptMatch = html.match(scriptRegex);
  return scriptMatch ? scriptMatch[1] : null;
}
