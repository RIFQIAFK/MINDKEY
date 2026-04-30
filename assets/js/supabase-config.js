var supabaseUrl = 'https://pacbybeqsmazefvdzggj.supabase.co';
var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY2J5YmVxc21hemVmdmR6Z2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUyNjMsImV4cCI6MjA5MzA2MTI2M30.WHCv0EzkMLKI6-jIatF8bucKTkmmZEA1sPXXO9r4edY';

// Gunakan window untuk menghindari konflik redeklarasi identifier
if (!window.supabaseClient) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error("Library Supabase (CDN) tidak ditemukan atau gagal dimuat.");
    }
}

// Global variable yang bisa diakses script lain
var supabase = window.supabaseClient;
