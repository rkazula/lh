import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

// Types for your Database should be imported from a generated file in a real project
// For now, we use 'any' or generic logical types
export type Database = any; 

let supabaseAnon: ReturnType<typeof createClient<Database>> | null = null;
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAnon() {
  if (!supabaseAnon) {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
    supabaseAnon = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseAnon;
}

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();
    supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}