-- 1. Create CLUB_PRESIDENT role if it doesn't exist
INSERT INTO roles (id, name, description, permissions)
SELECT uuid_generate_v4(), 'CLUB_PRESIDENT', 'Responsible for managing a university club', '["view_own_club", "manage_club_events", "send_club_messages"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CLUB_PRESIDENT');

-- 2. Create the clubs profile table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create a table for club members (students who join the club)
CREATE TABLE IF NOT EXISTS club_members (
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    club_role VARCHAR(50) DEFAULT 'member', -- member, vice_president, treasurer
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (club_id, student_user_id)
);

-- 4. Create a table for club events
CREATE TABLE IF NOT EXISTS club_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create a table for event RSVPs
CREATE TABLE IF NOT EXISTS club_event_rsvps (
    event_id UUID REFERENCES club_events(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, student_user_id)
);
