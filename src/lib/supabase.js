import { createClient } from '@supabase/supabase-js';

// Baca variabel lingkungan Vite atau berikan fallback aman
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-wishlist.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_safe_fallback';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-wishlist.supabase.co' &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')
);

export const supabase = createClient(
  supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder-wishlist.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_safe_fallback',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
