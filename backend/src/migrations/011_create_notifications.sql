-- Create notifications table for system alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('file_upload', 'certificate_request', 'absence_alert', 'grade_posted', 'announcement', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Add comment
COMMENT ON TABLE notifications IS 'System notifications and alerts for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification: file_upload, certificate_request, absence_alert, grade_posted, announcement, general';
COMMENT ON COLUMN notifications.link IS 'Optional URL to navigate when notification is clicked';
COMMENT ON COLUMN notifications.related_id IS 'Optional ID of related entity (e.g., certificate_id, file_id)';
