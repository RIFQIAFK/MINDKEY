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
