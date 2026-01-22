const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('   Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env');
    throw new Error('Missing Supabase environment variables');
}

// Public client (for inserts via RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (bypasses RLS - use with caution!)
const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

if (!supabaseAdmin) {
    console.warn('⚠️  SUPABASE_SERVICE_KEY not set - admin functions will be limited');
}

module.exports = { supabase, supabaseAdmin };
