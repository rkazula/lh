import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Pobranie konfiguracji ze zmiennych środowiskowych Vite z bezpiecznym fallbackiem
const DEFAULT_SUPABASE_URL = 'https://yiffkwrzwaudargjtbkb.supabase.co';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && typeof window !== 'undefined') {
  console.warn(
    '[Supabase] Ostrzeżenie: Brak klucza VITE_SUPABASE_PUBLISHABLE_KEY w pliku .env. Uzupełnij zmienne środowiskowe.'
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY || 'dummy-anon-key-placeholder',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
