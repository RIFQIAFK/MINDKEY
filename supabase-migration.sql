-- ============================================================
-- MindKey Supabase SQL Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Tabel USERS (Registrasi Pengguna) ──────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username      TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Siapapun bisa mendaftar (INSERT)
DROP POLICY IF EXISTS "Allow registration insert" ON users;
CREATE POLICY "Allow registration insert" ON users
    FOR INSERT WITH CHECK (true);

-- Policy: Baca data user (untuk login check)
DROP POLICY IF EXISTS "Allow select users" ON users;
CREATE POLICY "Allow select users" ON users
    FOR SELECT USING (true);


-- ── 2. Tabel HELP_TICKETS (Komplain Pelanggan) ────────────
CREATE TABLE IF NOT EXISTS help_tickets (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name    TEXT NOT NULL,
    user_email   TEXT NOT NULL,
    message      TEXT NOT NULL,
    status       TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    admin_reply  TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE help_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: User bisa submit tiket
DROP POLICY IF EXISTS "Allow ticket insert" ON help_tickets;
CREATE POLICY "Allow ticket insert" ON help_tickets
    FOR INSERT WITH CHECK (true);

-- Policy: Baca semua tiket (untuk admin)
DROP POLICY IF EXISTS "Allow ticket select" ON help_tickets;
CREATE POLICY "Allow ticket select" ON help_tickets
    FOR SELECT USING (true);

-- Policy: Admin bisa update status & reply
DROP POLICY IF EXISTS "Allow ticket update" ON help_tickets;
CREATE POLICY "Allow ticket update" ON help_tickets
    FOR UPDATE USING (true);


-- ── 3. Tabel PAYMENTS (Sudah ada, pastikan RLS-nya benar) ──
-- Jika tabel payments belum ada, buat dengan:
CREATE TABLE IF NOT EXISTS payments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name   TEXT NOT NULL,
    user_email  TEXT NOT NULL,
    status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'activated')),
    token       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow payment insert" ON payments;
CREATE POLICY "Allow payment insert" ON payments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow payment select" ON payments;
CREATE POLICY "Allow payment select" ON payments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow payment update" ON payments;
CREATE POLICY "Allow payment update" ON payments
    FOR UPDATE USING (true);

-- ============================================================
-- Selesai! Refresh Supabase dashboard untuk melihat tabel.
-- ============================================================
