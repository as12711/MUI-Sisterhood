-- ============================================
-- ADMIN AUTHENTICATION SCHEMA
-- For Man Up! Inc. Sisterhood Initiative Admin Dashboard
-- ============================================

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    first_login BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" 
    ON admin_users FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- INITIAL ADMIN USERS (Replace with actual emails)
-- ============================================
INSERT INTO admin_users (name, email, password_hash, first_login, is_active)
VALUES 
    ('[YOUR_NAME_HERE]', '[YOUR_EMAIL_HERE]', NULL, true, true)
ON CONFLICT (email) DO NOTHING;
