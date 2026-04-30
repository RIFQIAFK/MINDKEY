function openPurchaseModal() {
    if (!checkLogin()) {
        showToast("Silakan login terlebih dahulu!", "error");
        setTimeout(() => {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'pages/login.html' : 'login.html';
        }, 1500);
        return;
    }
    
    const modal = document.getElementById('purchaseModal');
    if (!modal) {
        // Fallback jika modal tidak ada di halaman ini
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? 'pages/bayar.html' : 'bayar.html';
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

async function confirmPayment() {
    const user = checkLogin();
    if (!user) return;

    const success = await submitPaymentToSupabase(user, 49000);
    
    if (success) {
        const confirmEmail = document.getElementById('confirmEmail');
        if (confirmEmail) confirmEmail.textContent = user.email;
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.add('show');
    }
}

async function processActivation() {
    const tokenInput = document.getElementById('tokenInput').value.trim();
    const btn = document.getElementById('activateBtn');
    const status = document.getElementById('activationStatus');
    
    if (!tokenInput) {
        showToast("Masukkan token terlebih dahulu", "error");
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';
    btn.disabled = true;
    if (status) status.textContent = '';
    
    const isValid = await verifyAppToken(tokenInput);
    
    if (isValid) {
        if (status) status.innerHTML = '<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Token Valid! Aplikasi Premium Diaktifkan.</span>';
        showToast("Aktivasi Berhasil!", "success");
        setTimeout(() => {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'index.html' : '../index.html';
        }, 2000);
    } else {
        if (status) status.innerHTML = '<span style="color:#dc2626;"><i class="fas fa-times-circle"></i> Token tidak valid atau belum disetujui.</span>';
        showToast("Aktivasi Gagal!", "error");
        btn.innerHTML = '<i class="fas fa-key"></i> Validasi Token';
        btn.disabled = false;
    }
}
