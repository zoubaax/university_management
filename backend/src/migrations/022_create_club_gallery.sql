-- Create Club Gallery table
CREATE TABLE IF NOT EXISTS club_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval by club
CREATE INDEX idx_club_gallery_club_id ON club_gallery(club_id);
