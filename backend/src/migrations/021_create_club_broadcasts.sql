-- Create Club Broadcasts table
CREATE TABLE IF NOT EXISTS club_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval by club
CREATE INDEX idx_club_broadcasts_club_id ON club_broadcasts(club_id);
