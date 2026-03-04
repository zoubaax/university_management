-- Ensure all required columns exist and have appropriate defaults to prevent creation errors
DO $$
BEGIN
    -- Fix user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'user_id') THEN
        ALTER TABLE clubs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Fix department_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'department_id') THEN
        ALTER TABLE clubs ADD COLUMN department_id UUID REFERENCES departments(id);
    END IF;

    -- Fix category (The one causing the error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'category') THEN
        ALTER TABLE clubs ADD COLUMN category VARCHAR(100) DEFAULT 'Social' NOT NULL;
    ELSE
        -- If it exists but has no default and is NOT NULL, let's add the default
        ALTER TABLE clubs ALTER COLUMN category SET DEFAULT 'Social';
        UPDATE clubs SET category = 'Social' WHERE category IS NULL;
    END IF;

    -- Fix status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'status') THEN
        ALTER TABLE clubs ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Fix description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'description') THEN
        ALTER TABLE clubs ADD COLUMN description TEXT;
    END IF;

    -- Fix updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'updated_at') THEN
        ALTER TABLE clubs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
