function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.remove('show');
    
    if (type === 'error') {
        toast.style.background = '#dc2626';
    } else if (type === 'success') {
        toast.style.background = '#10b981';
    } else {
        toast.style.background = '#442a22';
    }
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function scrollToFeatures() {
    const el = document.getElementById('fitur');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (btn) {
            btn.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });
}

function showFullQRIS() {
    const modal = document.getElementById('qrisModal');
    if (modal) modal.classList.add('show');
}

function closeFullQRIS() {
    const modal = document.getElementById('qrisModal');
    if (modal) modal.classList.remove('show');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('show');
    const isRoot = !window.location.pathname.includes('/pages/');
    window.location.href = isRoot ? 'index.html' : '../index.html';
}

function initFaqSearch() {
    const searchInput = document.getElementById('faqSearchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function initFaqCategories() {
    const catButtons = document.querySelectorAll('.faq-cat-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.cat;
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.cat === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function submitHelpForm(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    if (message) {
        const successMsg = document.getElementById('formSuccessMessage');
        if (successMsg) successMsg.classList.remove('hidden');
        document.getElementById('helpForm').reset();
        showToast("Pesan terkirim!", "success");
        setTimeout(() => {
            if (successMsg) successMsg.classList.add('hidden');
        }, 3000);
    }
}
