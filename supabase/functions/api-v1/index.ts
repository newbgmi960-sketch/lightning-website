import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('key') || req.headers.get('x-api-key');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key is required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve environment configured secret API Key or validate against database
    const expectedApiKey = Deno.env.get('CUSTOM_API_KEY') || 'default_secret_key_123';
    
    if (apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired API key.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return general API status response
    return new Response(
      JSON.stringify({
        success: true,
        system_status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        message: 'Welcome to your custom Supabase Edge API!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
