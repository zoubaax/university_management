-- Add 'user' to sender_type and recipient_type check constraints in messages table
-- This allows Club President accounts (which are generic Users) to send/receive messages

-- 1. Drop existing constraints
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_type_check;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_type_check;

-- 2. Add new constraints including 'user'
ALTER TABLE messages ADD CONSTRAINT messages_sender_type_check CHECK (sender_type IN ('employee', 'student', 'user'));
ALTER TABLE messages ADD CONSTRAINT messages_recipient_type_check CHECK (recipient_type IN ('employee', 'student', 'user'));

-- Also check if there are any other constraints we need to update
COMMENT ON COLUMN messages.sender_type IS 'Type of sender: employee, student, or user (for Clubs)';
COMMENT ON COLUMN messages.recipient_type IS 'Type of recipient: employee, student, or user (for Clubs)';
