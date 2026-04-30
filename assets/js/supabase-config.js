const supabaseUrl = 'https://pacbybeqsmazefvdzggj.supabase.co';
const supabaseKey = 'sb_publishable_kQT3uCgJlkt09udppx3CAA_llDU_NmB';

// Initialize Supabase if the CDN script is loaded
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
    console.warn("Supabase tidak dimuat. Pastikan Anda telah memasukkan CDN script di HTML.");
}
