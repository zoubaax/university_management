-- Add description and permissions columns to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Update existing roles with default permissions based on hardcoded values (optional but good for consistency)
-- Example: SUPER_ADMIN
UPDATE roles 
SET permissions = '["manage_everything"]'::jsonb,
    description = 'Has full access to all resources'
WHERE name = 'SUPER_ADMIN';

-- Example: STUDENT
UPDATE roles 
SET permissions = '["view_own_profile", "view_own_grades", "view_own_schedule", "request_certificate"]'::jsonb,
    description = 'Standard student access'
WHERE name = 'STUDENT';

-- Example: PROFESSOR
UPDATE roles 
SET permissions = '["view_assigned_classes", "manage_grades", "manage_attendance", "upload_resources"]'::jsonb,
    description = 'Academic staff with teaching responsibilities'
WHERE name = 'PROFESSOR';
