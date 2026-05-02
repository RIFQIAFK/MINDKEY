document.addEventListener('DOMContentLoaded', async () => {
    // Only run auth check if NOT on admin or login pages
    const path = window.location.pathname;
    const isAdminPage  = path.includes('admin');
    const isLoginPage  = path.includes('login');

    if (!isAdminPage && !isLoginPage) {
        checkLogin();
    }

    // Supabase connection debug
    if (supabase && !isAdminPage) {
        const { data, error } = await supabase.from('payments').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn("Supabase 'payments' table check:", error.message);
        } else {
            console.log("✅ Supabase connected.");
        }
    }

    // Initialize UI components
    if (typeof initFaqAccordion === 'function') initFaqAccordion();
    if (typeof initMobileMenu === 'function') initMobileMenu();

    // Load admin payments if on admin page
    if (typeof loadAdminPayments === 'function' && document.getElementById('paymentTableBody')) {
        loadAdminPayments();
    }
});
