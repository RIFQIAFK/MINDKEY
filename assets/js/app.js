document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    if (typeof initFaqAccordion === 'function') initFaqAccordion();
    if (typeof loadAdminPayments === 'function') loadAdminPayments();
});
