// ============================================================
// admin.js — MindKey Admin Dashboard Logic
// ============================================================

// ─── PAYMENTS ───────────────────────────────────────────────

async function loadAdminPayments() {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;

    if (!supabase) {
        tbody.innerHTML = '<tr><td colspan="6" class="error-row"><i class="fas fa-exclamation-circle"></i> Error: Supabase tidak dimuat.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Memuat data pembayaran...</td></tr>';

    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-row"><i class="fas fa-inbox"></i><br>Belum ada data pembayaran</td></tr>';
            return;
        }

        tbody.innerHTML = payments.map(p => `
            <tr>
                <td class="id-cell">${p.id ? p.id.substring(0,8) : '-'}...</td>
                <td><strong>${p.user_name || '-'}</strong></td>
                <td class="email-cell">${p.user_email || '-'}</td>
                <td>${p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'}) : '-'}</td>
                <td><span class="status-badge status-${p.status}">${statusLabel(p.status)}</span></td>
                <td class="action-btns">
                    ${p.status === 'pending'
                        ? `<button class="btn-approve" onclick="approvePayment('${p.id}')"><i class="fas fa-check"></i> Setujui</button>
                           <button class="btn-reject"  onclick="rejectPayment('${p.id}')"><i class="fas fa-times"></i> Tolak</button>`
                        : (p.token
                            ? `<span class="token-label"><i class="fas fa-key"></i> ${p.token}</span>`
                            : '<span class="done-label">Selesai</span>')}
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error loading payments:', err);
        tbody.innerHTML = `<tr><td colspan="6" class="error-row"><i class="fas fa-exclamation-triangle"></i> Gagal memuat: ${err.message}</td></tr>`;
    }
}

function statusLabel(s) {
    const map = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
    return map[s] || s;
}

async function approvePayment(id) {
    if (!supabase) return;
    
    // Matikan tombol agar tidak double klik
    if (event && event.target) {
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...';
    }

    const token = 'MIND-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
        // 1. Ambil data pembayaran untuk dapat Email & Nama
        const { data: p, error: fetchErr } = await supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();
        
        if (fetchErr) throw fetchErr;

        // 2. Update status & token di database
        const { error: updateErr } = await supabase
            .from('payments')
            .update({ status: 'approved', token: token })
            .eq('id', id);
            
        if (updateErr) throw updateErr;

        // 3. Kirim Email Otomatis via EmailJS
        const templateParams = {
            email: p.user_email,
            name: p.user_name,
            title: "Pembelian MindKey Disetujui! 🦉",
            admin_reply: `Selamat! Pembelian Anda telah disetujui.\n\nToken Aktivasi: ${token}\nLink Download APK: https://bit.ly/DownloadMindKeyAPK\n\nSilakan masukkan token tersebut di menu Aktivasi aplikasi MindKey untuk membuka semua fitur.`,
        };

        if (typeof emailjs !== 'undefined') {
            await emailjs.send('service_2ehevtg', 'template_w5j90r2', templateParams);
            showToast(`✅ Disetujui & APK Terkirim ke ${p.user_email}`, 'success');
        } else {
            showToast(`✅ Disetujui! Token: ${token}`, 'success');
        }

        loadAdminPayments();
    } catch (err) {
        console.error('Approve error:', err);
        showToast('Gagal memproses: ' + err.message, 'error');
        loadAdminPayments(); // Refresh table untuk reset tombol
    }
}

async function rejectPayment(id) {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('payments').update({ status: 'rejected' }).eq('id', id);
        if (error) throw error;
        showToast('❌ Pembayaran ditolak', 'error');
        loadAdminPayments();
    } catch (err) {
        showToast('Gagal menolak: ' + err.message, 'error');
    }
}

// ─── COMPLAINTS (HELP TICKETS) ───────────────────────────────

let allTickets = [];
let currentFilter = 'all';
let replyTargetId = null;

async function loadComplaints() {
    const list = document.getElementById('complaintsList');
    if (!list) return;

    if (!supabase) {
        list.innerHTML = '<div class="error-row"><i class="fas fa-exclamation-circle"></i> Supabase tidak dimuat.</div>';
        return;
    }

    list.innerHTML = '<div class="loading-row"><i class="fas fa-spinner fa-spin"></i> Memuat tiket bantuan...</div>';

    try {
        const { data: tickets, error } = await supabase
            .from('help_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allTickets = tickets || [];
        updateCounts();
        renderComplaints(allTickets, currentFilter);

    } catch (err) {
        console.error('Error loading tickets:', err);
        list.innerHTML = `<div class="error-row"><i class="fas fa-exclamation-triangle"></i> Gagal memuat tiket: ${err.message}</div>`;
    }
}

function updateCounts() {
    const countAll      = allTickets.length;
    const countOpen     = allTickets.filter(t => t.status === 'open').length;
    const countProgress = allTickets.filter(t => t.status === 'in_progress').length;
    const countResolved = allTickets.filter(t => t.status === 'resolved').length;

    document.getElementById('countAll')      && (document.getElementById('countAll').textContent      = countAll);
    document.getElementById('countOpen')     && (document.getElementById('countOpen').textContent     = countOpen);
    document.getElementById('countProgress') && (document.getElementById('countProgress').textContent = countProgress);
    document.getElementById('countResolved') && (document.getElementById('countResolved').textContent = countResolved);

    const badge = document.getElementById('openTicketCount');
    if (badge) { badge.textContent = countOpen; badge.style.display = countOpen > 0 ? 'inline-flex' : 'none'; }
}

function renderComplaints(tickets, filter) {
    const list = document.getElementById('complaintsList');
    if (!list) return;

    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-row"><i class="fas fa-check-double"></i><br>Tidak ada tiket ${filter === 'all' ? '' : '— ' + filterLabel(filter)}</div>`;
        return;
    }

    list.innerHTML = filtered.map(t => `
        <div class="complaint-card status-card-${t.status}">
            <div class="complaint-meta">
                <div class="complaint-user">
                    <div class="user-avatar">${(t.user_name || '?')[0].toUpperCase()}</div>
                    <div>
                        <strong>${t.user_name || 'Anonim'}</strong>
                        <span class="user-email">${t.user_email || '-'}</span>
                    </div>
                </div>
                <div class="complaint-right">
                    <span class="complaint-date">${t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '-'}</span>
                    <span class="ticket-status-badge status-ticket-${t.status}">${ticketStatusLabel(t.status)}</span>
                </div>
            </div>

            <div class="complaint-message">
                <p>${escHtml(t.message || '')}</p>
            </div>

            ${t.admin_reply ? `
            <div class="admin-reply-preview">
                <i class="fas fa-reply"></i> <strong>Balasan Admin:</strong> ${escHtml(t.admin_reply)}
            </div>` : ''}

            <div class="complaint-actions">
                ${t.status !== 'resolved' ? `
                    <button class="btn-reply" onclick="openReplyModal('${t.id}', '${escAttr(t.user_name)}', '${escAttr(t.user_email)}', '${escAttr(t.message)}')">
                        <i class="fas fa-reply"></i> Balas
                    </button>
                    <button class="btn-resolve" onclick="resolveTicket('${t.id}')">
                        <i class="fas fa-check-double"></i> Tandai Selesai
                    </button>
                ` : '<span class="resolved-label"><i class="fas fa-check-circle"></i> Selesai ditangani</span>'}
            </div>
        </div>
    `).join('');
}

function filterComplaints(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const btnMap = { all: 'filterAll', open: 'filterOpen', in_progress: 'filterProgress', resolved: 'filterResolved' };
    const btn = document.getElementById(btnMap[filter]);
    if (btn) btn.classList.add('active');
    renderComplaints(allTickets, filter);
}

function ticketStatusLabel(s) {
    const map = { open: '🟡 Open', in_progress: '🔵 Diproses', resolved: '✅ Selesai' };
    return map[s] || s;
}

function filterLabel(s) {
    const map = { open: 'Open', in_progress: 'Sedang Diproses', resolved: 'Selesai' };
    return map[s] || s;
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
    return (str || '').replace(/'/g, "\\'").replace(/\n/g, ' ').substring(0, 100);
}

// ─── Reply Modal ─────────────────────────────────────────────

let replyTargetEmail = null;

function openReplyModal(id, userName, userEmail, message) {
    replyTargetId = id;
    replyTargetEmail = userEmail;
    document.getElementById('ticketPreview').innerHTML = `
        <strong><i class="fas fa-user"></i> ${escHtml(userName)} (${escHtml(userEmail)})</strong>
        <p>${escHtml(message.substring(0, 200))}${message.length > 200 ? '...' : ''}</p>
    `;
    document.getElementById('replyText').value = '';
    document.getElementById('replyModal').classList.remove('hidden');
}

function closeReplyModal() {
    document.getElementById('replyModal').classList.add('hidden');
    replyTargetId = null;
}

async function sendReply() {
    const reply = document.getElementById('replyText').value.trim();
    if (!reply) { showToast('Tulis balasan terlebih dahulu!', 'error'); return; }
    if (!supabase || !replyTargetId) return;

    const btn = document.querySelector('.btn-send-reply');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    try {
        // 1. Update Database Supabase
        const { error } = await supabase
            .from('help_tickets')
            .update({ admin_reply: reply, status: 'in_progress' })
            .eq('id', replyTargetId);

        if (error) throw error;

        // 2. Kirim Email via EmailJS
        const templateParams = {
            email: replyTargetEmail, // Sesuai template Anda {{email}}
            name: document.getElementById('ticketPreview').querySelector('strong').innerText.split('(')[0].trim(), // Sesuai {{name}}
            title: "Balasan dari Admin MindKey", // Sesuai {{title}}
            admin_reply: reply // Anda perlu tambahkan {{admin_reply}} di isi template EmailJS Anda
        };

        // Ganti SERVICE_ID dan TEMPLATE_ID sesuai dashboard EmailJS Anda
        if (typeof emailjs !== 'undefined') {
            try {
                await emailjs.send('service_2ehevtg', 'template_w5j90r2', templateParams);
                showToast('✅ Balasan disimpan & Email terkirim!', 'success');
            } catch (emailErr) {
                console.warn('EmailJS error:', emailErr);
                showToast('✅ Tersimpan (Email gagal kirim)', 'info');
            }
        } else {
            showToast('✅ Balasan berhasil disimpan!', 'success');
        }

        closeReplyModal();
        await loadComplaints();
    } catch (err) {
        console.error('Reply error:', err);
        showToast('Gagal memproses: ' + (err.message || 'Cek koneksi/EmailJS'), 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Balasan';
    }
}

async function resolveTicket(id) {
    if (!supabase) return;
    try {
        const { error } = await supabase
            .from('help_tickets')
            .update({ status: 'resolved' })
            .eq('id', id);
        if (error) throw error;
        showToast('✅ Tiket ditandai selesai!', 'success');
        await loadComplaints();
    } catch (err) {
        showToast('Gagal mengupdate tiket: ' + err.message, 'error');
    }
}
