import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mnecnbzhcmqsuqbuizqt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9kx6YkbL769j-L3FDiA0Xw_x6ONVIUp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
