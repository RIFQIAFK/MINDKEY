// ============================================
// MINDKEY - MAIN JAVASCRIPT
// All interactive functions
// ============================================

// ---------- SUPABASE SETUP ----------
const supabaseUrl = 'https://pacbybeqsmazefvdzggj.supabase.co';
const supabaseKey = 'sb_publishable_kQT3uCgJlkt09udppx3CAA_llDU_NmB';

// Initialize Supabase if the CDN script is loaded
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
    console.warn("Supabase tidak dimuat. Pastikan Anda telah memasukkan CDN script di HTML.");
}

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
    if (!modal) {
        // Fallback jika modal tidak ada di halaman ini
        window.location.href = 'bayar.html';
        return;
    }

    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (userEmailDisplay && currentUser) {
        userEmailDisplay.textContent = currentUser.email;
    }
    
    const paymentFlow = document.getElementById('paymentFlow');
    const pendingFlow = document.getElementById('pendingFlow');
    
    if (paymentFlow) paymentFlow.classList.remove('hidden');
    if (pendingFlow) pendingFlow.classList.add('hidden');
    
    modal.classList.add('show');
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) modal.classList.remove('show');
}

async function submitPaymentRequest() {
    if (!currentUser) return;
    
    const success = await submitPaymentToSupabase(currentUser, 49000);
    
    if (success) {
        const paymentFlow = document.getElementById('paymentFlow');
        const pendingFlow = document.getElementById('pendingFlow');
        if (paymentFlow) paymentFlow.classList.add('hidden');
        if (pendingFlow) pendingFlow.classList.remove('hidden');
        showToast("Permintaan pembayaran telah dikirim!", "success");
    }
}

// ---------- SUPABASE DATABASE FUNCTIONS ----------
async function submitPaymentToSupabase(user, amount) {
    if (!supabase) {
        showToast("Sistem belum siap. (Supabase Error)", "error");
        return false;
    }
    
    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([
                { 
                    user_email: user.email, 
                    user_name: user.name, 
                    amount: amount, 
                    status: 'pending' 
                }
            ]);
            
        if (error) {
            console.error("Supabase Error:", error);
            alert("Database Error: " + (error.message || "Tabel 'payments' mungkin belum dibuat di Supabase. Silakan cek SQL Editor Supabase Anda."));
            return false;
        }
        
        return true;
    } catch (err) {
        console.error("Error submitting payment:", err);
        alert("Terjadi kesalahan koneksi ke Supabase.");
        return false;
    }
}

async function verifyAppToken(token) {
    if (!supabase) return false;
    
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('token', token)
            .eq('status', 'approved')
            .single();
            
        if (error) {
            console.error("Supabase Error:", error);
            return false;
        }
        
        if (data) {
            // Token valid
            localStorage.setItem('mindkey_premium', 'true');
            return true;
        }
        return false;
    } catch (err) {
        console.error("Error verifying token:", err);
        return false;
    }
}

// ---------- ADMIN FUNCTIONS (SUPABASE) ----------
async function loadAdminPayments() {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;
    
    if (!supabase) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Error: Supabase CDN tidak dimuat.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Memuat data dari server...</td></tr>';
    
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada data pembayaran</td></tr>';
            return;
        }
        
        tbody.innerHTML = payments.map(p => `
            <tr>
                <td style="font-size: 12px; color: #888;">${p.id ? p.id.substring(0,8) : '-'}...</td>
                <td>${p.user_name}</td>
                <td>${p.user_email}</td>
                <td>${p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</td>
                <td><span class="status-badge status-${p.status}">${p.status === 'pending' ? 'Menunggu' : p.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span></td>
                <td class="action-btns">
                    ${p.status === 'pending' ? `
                        <button class="btn-approve" onclick="approvePayment('${p.id}')">Setujui</button>
                        <button class="btn-reject" onclick="rejectPayment('${p.id}')">Tolak</button>
                    ` : (p.token ? `<strong style="color:#10b981; font-size:12px;">Token: ${p.token}</strong>` : '-')}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error loading payments:", err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Terjadi kesalahan saat memuat data. Pastikan Anda telah membuat tabel "payments" di Supabase Dashboard.</td></tr>';
        alert("Gagal memuat data Admin. Pastikan tabel 'payments' sudah ada di Supabase!");
    }
}

async function approvePayment(id) {
    if (!supabase) return;
    
    const token = 'MIND-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
        const { data, error } = await supabase
            .from('payments')
            .update({ status: 'approved', token: token })
            .eq('id', id);
            
        if (error) throw error;
        
        showToast(`✅ Disetujui! Token: ${token}`, "success");
        loadAdminPayments();
    } catch (err) {
        console.error("Error approving:", err);
        showToast("Gagal menyetujui. Cek console.", "error");
    }
}

async function rejectPayment(id) {
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('payments')
            .update({ status: 'rejected' })
            .eq('id', id);
            
        if (error) throw error;
        
        showToast("❌ Ditolak", "error");
        loadAdminPayments();
    } catch (err) {
        console.error("Error rejecting:", err);
        showToast("Gagal menolak. Cek console.", "error");
    }
}

// ---------- SCROLL & UI ----------
function scrollToFeatures() {
    const el = document.getElementById('fitur');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    }
}

// ---------- HELP FORM ----------
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

// ---------- FAQ ACCORDION ----------
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

// ---------- INITIALIZE ----------
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    initFaqAccordion();
});