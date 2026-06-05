import { createClient } from '@supabase/supabase-js';

// ============================================================
// CLIENTE SUPABASE — TechStore
// Credenciales desde .env.local
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://ccfhpovymmqgjtyybfpw.supabase.co',
  supabaseKey  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZmhwb3Z5bW1xZ2p0eXliZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjEzNjgsImV4cCI6MjA5NDA5NzM2OH0.YEJGy855z6UGf8p5xAoNseAYNEZ8iQ-FXQFBnbZCh0Y',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
