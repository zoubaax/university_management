-- Add registration_open column to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN clubs.registration_open IS 'Whether the club is currently accepting new member applications';
