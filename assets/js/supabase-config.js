const supabaseUrl = 'https://pacbybeqsmazefvdzggj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY2J5YmVxc21hemVmdmR6Z2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUyNjMsImV4cCI6MjA5MzA2MTI2M30.WHCv0EzkMLKI6-jIatF8bucKTkmmZEA1sPXXO9r4edY';

// Initialize Supabase if the CDN script is loaded
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
    console.warn("Supabase tidak dimuat. Pastikan Anda telah memasukkan CDN script di HTML.");
}
