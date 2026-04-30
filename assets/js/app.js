document.addEventListener('DOMContentLoaded', async () => {
    checkLogin();
    
    // Debug Supabase Connection
    if (supabase) {
        console.log("Supabase Client initialized successfully.");
        const { data, error } = await supabase.from('payments').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("Supabase Database Error (Table 'payments' might be missing):", error.message);
        } else {
            console.log("Supabase Database connected successfully.");
        }
    } else {
        console.error("Supabase Client failed to initialize.");
    }

    if (typeof initFaqAccordion === 'function') initFaqAccordion();
    if (typeof loadAdminPayments === 'function') loadAdminPayments();
});
