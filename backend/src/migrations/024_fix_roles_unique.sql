-- Fix roles table to ensure 'name' is unique for ON CONFLICT support
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key'
    ) THEN
        ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name);
    END IF;
END $$;
