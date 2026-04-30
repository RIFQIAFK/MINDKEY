let currentUser = null;

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
        // Check if we are in pages folder or root
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? 'index.html' : '../index.html';
    } else if (email) {
        showToast("Email tidak valid!", "error");
    }
}

function logoutUser() {
    localStorage.removeItem('mindkey_user');
    showToast("Anda telah keluar", "info");
    setTimeout(() => {
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? 'pages/login.html' : 'login.html';
    }, 1000);
}
