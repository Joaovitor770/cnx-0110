import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlccgamgufnbvybkrfne.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
    console.error("Supabase Key not found! Please add VITE_SUPABASE_KEY to your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey || 'placeholder-key');
