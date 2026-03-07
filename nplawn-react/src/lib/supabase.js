import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[supabase] URL:', supabaseUrl, '| KEY:', supabaseKey ? 'present' : 'MISSING');
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars missing — orders will only be saved to localStorage.');
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
