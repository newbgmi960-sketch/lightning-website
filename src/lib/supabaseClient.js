import { createClient } from '@supabase/supabase-js';

// These are the intentionally public Supabase project URL and publishable key.
// They keep the public landing page available even when a static host has not
// been configured with VITE_* build variables; RLS and protected RPCs enforce
// the actual data-access boundary.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mnecnbzhcmqsuqbuizqt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9kx6YkbL769j-L3FDiA0Xw_x6ONVIUp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
