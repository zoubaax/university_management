-- Safely add missing columns to clubs table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE clubs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'department_id'
    ) THEN
        ALTER TABLE clubs ADD COLUMN department_id UUID REFERENCES departments(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'description'
    ) THEN
        ALTER TABLE clubs ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE clubs ADD COLUMN logo_url VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'status'
    ) THEN
        ALTER TABLE clubs ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clubs' AND column_name = 'category'
    ) THEN
        ALTER TABLE clubs ADD COLUMN category VARCHAR(100) DEFAULT 'Social' NOT NULL;
    END IF;
END $$;

