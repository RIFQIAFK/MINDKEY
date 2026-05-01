// ============================================================
// auth.js — MindKey Authentication (Register + Login)
// ============================================================

let currentUser = null;

// --- SHA-256 Hash Utility ---
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Check Login Status ---
function checkLogin() {
    const userStr = localStorage.getItem('mindkey_user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.innerHTML = `<i class="fas fa-user-circle"></i> Halo, ${currentUser.username || currentUser.name}`;
        }
        return currentUser;
    }
    // Redirect to login if not logged in
    const isRoot = !window.location.pathname.includes('/pages/');
    const loginPath = isRoot ? 'pages/login.html' : 'login.html';
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('admin')) {
        window.location.replace(loginPath);
    }
    return null;
}

// --- Register New User ---
async function registerUser(username, email, password, confirmPassword) {
    if (!username || !email || !password || !confirmPassword) {
        showToast('Semua kolom wajib diisi!', 'error'); return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('Format Gmail tidak valid!', 'error'); return;
    }
    if (password.length < 6) {
        showToast('Password minimal 6 karakter!', 'error'); return;
    }
    if (password !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok!', 'error'); return;
    }
    if (!supabase) { showToast('Koneksi database gagal!', 'error'); return; }

    const btn = document.getElementById('registerBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...'; }

    try {
        // Check if email already exists
        const { data: existing, error: checkErr } = await supabase
            .from('users')
            .select('email')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (existing) {
            showToast('Email sudah terdaftar! Silakan login.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-user-plus"></i> Buat Akun'; }
            return;
        }

        const passwordHash = await hashPassword(password);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username: username.trim(), email: email.toLowerCase().trim(), password_hash: passwordHash }])
            .select()
            .single();

        if (error) throw error;

        const user = { id: data.id, username: data.username, email: data.email };
        localStorage.setItem('mindkey_user', JSON.stringify(user));
        showToast(`🎉 Selamat datang, ${data.username}!`, 'success');

        setTimeout(() => {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'index.html' : '../index.html';
        }, 1200);

    } catch (err) {
        console.error('Register error:', err);
        showToast('Gagal mendaftar: ' + (err.message || 'Cek koneksi database.'), 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-user-plus"></i> Buat Akun'; }
    }
}

// --- Login Existing User ---
async function loginUser(email, password) {
    if (!email || !password) {
        showToast('Email dan password wajib diisi!', 'error'); return;
    }
    if (!email.includes('@')) {
        showToast('Format Gmail tidak valid!', 'error'); return;
    }
    if (!supabase) { showToast('Koneksi database gagal!', 'error'); return; }

    const btn = document.getElementById('loginBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masuk...'; }

    try {
        const passwordHash = await hashPassword(password);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .eq('password_hash', passwordHash)
            .maybeSingle();

        if (error) throw error;

        if (!user) {
            showToast('Email atau password salah!', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk'; }
            return;
        }

        const sessionUser = { id: user.id, username: user.username, email: user.email };
        localStorage.setItem('mindkey_user', JSON.stringify(sessionUser));
        showToast(`👋 Selamat datang kembali, ${user.username}!`, 'success');

        setTimeout(() => {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'index.html' : '../index.html';
        }, 1200);

    } catch (err) {
        console.error('Login error:', err);
        showToast('Gagal login: ' + (err.message || 'Cek koneksi database.'), 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk'; }
    }
}

// --- Logout User ---
function logoutUser() {
    localStorage.removeItem('mindkey_user');
    currentUser = null;
    showToast('Anda telah keluar.', 'info');
    setTimeout(() => {
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? 'pages/login.html' : 'login.html';
    }, 1000);
}
