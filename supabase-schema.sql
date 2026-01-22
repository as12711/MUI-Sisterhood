-- ============================================
-- MAN UP! INC. SISTERHOOD INITIATIVE
-- Database Schema for Supabase
-- ============================================

-- Drop existing table if exists (for clean setup)
DROP TABLE IF EXISTS sisterhood_signups CASCADE;

-- Create the sisterhood_signups table
CREATE TABLE sisterhood_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core fields (required)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Optional fields
    referral_source TEXT,
    goals TEXT,
    
    -- Contact preferences
    newsletter_opt_in BOOLEAN DEFAULT true,
    
    -- Admin fields
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'enrolled', 'active', 'inactive', 'completed')),
    notes TEXT,
    entry_source TEXT DEFAULT 'online' CHECK (entry_source IN ('online', 'manual', 'paper', 'phone', 'event')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email (case-insensitive)
CREATE UNIQUE INDEX idx_sisterhood_email ON sisterhood_signups(LOWER(email));

-- Create indexes for common queries
CREATE INDEX idx_sisterhood_status ON sisterhood_signups(status);
CREATE INDEX idx_sisterhood_created_at ON sisterhood_signups(created_at DESC);

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_sisterhood_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_sisterhood_signups_updated_at ON sisterhood_signups;
CREATE TRIGGER update_sisterhood_signups_updated_at 
    BEFORE UPDATE ON sisterhood_signups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_sisterhood_updated_at();

-- Enable Row Level Security
ALTER TABLE sisterhood_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for online signups)
CREATE POLICY "Allow public inserts" 
    ON sisterhood_signups FOR INSERT 
    WITH CHECK (true);

-- Policy: Allow public selects (for admin dashboard)
CREATE POLICY "Allow public selects" 
    ON sisterhood_signups FOR SELECT 
    USING (true);

-- Policy: Allow public updates (for admin dashboard status changes)
CREATE POLICY "Allow public updates" 
    ON sisterhood_signups FOR UPDATE 
    USING (true);

-- Policy: Allow public deletes (for admin to remove entries)
CREATE POLICY "Allow public deletes" 
    ON sisterhood_signups FOR DELETE 
    USING (true);
