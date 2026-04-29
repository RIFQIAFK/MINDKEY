// ============================================
// MINDKEY - MAIN JAVASCRIPT
// All interactive functions
// ============================================

let currentUser = null;

// ---------- AUTHENTICATION ----------
function checkLogin() {
    const userStr = localStorage.getItem('mindkey_user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.innerHTML = `Halo, ${currentUser.name}`;
        }
        return currentUser;
    }
    return null;
}

function loginUser() {
    const email = prompt("Masukkan Email Anda (contoh: user@gmail.com):", "");
    if (email && email.includes('@')) {
        const name = email.split('@')[0];
        const user = { email: email, name: name };
        localStorage.setItem('mindkey_user', JSON.stringify(user));
        showToast("Login berhasil!", "success");
        window.location.href = 'index.html';
    } else if (email) {
        showToast("Email tidak valid!", "error");
    }
}

function logoutUser() {
    localStorage.removeItem('mindkey_user');
    showToast("Anda telah keluar", "info");
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ---------- TOAST ----------
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

// ---------- MODAL ----------
function openPurchaseModal() {
    if (!checkLogin()) {
        showToast("Silakan login terlebih dahulu!", "error");
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const modal = document.getElementById('purchaseModal');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (userEmailDisplay && currentUser) {
        userEmailDisplay.textContent = currentUser.email;
    }
    
    document.getElementById('paymentFlow').classList.remove('hidden');
    document.getElementById('pendingFlow').classList.add('hidden');
    modal.classList.add('show');
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('show');
}

function submitPaymentRequest() {
    if (!currentUser) return;
    
    let payments = JSON.parse(localStorage.getItem('mindkey_payments') || '[]');
    payments.push({
        id: 'PAY-' + Date.now(),
        userName: currentUser.name,
        email: currentUser.email,
        date: new Date().toISOString(),
        status: 'pending',
        amount: 49000
    });
    localStorage.setItem('mindkey_payments', JSON.stringify(payments));
    
    document.getElementById('paymentFlow').classList.add('hidden');
    document.getElementById('pendingFlow').classList.remove('hidden');
    showToast("Permintaan pembayaran telah dikirim!", "success");
}

// ---------- SCROLL ----------
function scrollToFeatures() {
    document.getElementById('fitur').scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    }
}

// ---------- ADMIN FUNCTIONS ----------
function loadAdminPayments() {
    const payments = JSON.parse(localStorage.getItem('mindkey_payments') || '[]');
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada data pembayaran</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.userName}</td>
            <td>${p.email}</td>
            <td>${new Date(p.date).toLocaleDateString('id-ID')}</td>
            <td><span class="status-badge status-${p.status}">${p.status === 'pending' ? 'Menunggu' : p.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span></td>
            <td class="action-btns">
                ${p.status === 'pending' ? `
                    <button class="btn-approve" onclick="approvePayment('${p.id}')">Setujui</button>
                    <button class="btn-reject" onclick="rejectPayment('${p.id}')">Tolak</button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

function approvePayment(id) {
    let payments = JSON.parse(localStorage.getItem('mindkey_payments') || '[]');
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
        payments[index].status = 'approved';
        localStorage.setItem('mindkey_payments', JSON.stringify(payments));
        const token = 'MIND-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        showToast(`✅ Disetujui! Token: ${token}`, "success");
        loadAdminPayments();
    }
}

function rejectPayment(id) {
    let payments = JSON.parse(localStorage.getItem('mindkey_payments') || '[]');
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
        payments[index].status = 'rejected';
        localStorage.setItem('mindkey_payments', JSON.stringify(payments));
        showToast("❌ Pembayaran ditolak", "error");
        loadAdminPayments();
    }
}

// ---------- HELP FORM ----------
function submitHelpForm(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    if (message) {
        document.getElementById('formSuccessMessage').classList.remove('hidden');
        document.getElementById('helpForm').reset();
        showToast("Pesan terkirim!", "success");
        setTimeout(() => {
            document.getElementById('formSuccessMessage').classList.add('hidden');
        }, 3000);
    }
}

// ---------- FAQ ACCORDION ----------
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

// ---------- INITIALIZE ----------
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    initFaqAccordion();
    
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePurchaseModal();
        });
    }
});