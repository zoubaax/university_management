const { query } = require('./config/db');

async function recreateMessagesTable() {
    try {
        console.log('Dropping existing messages table...');
        await query('DROP TABLE IF EXISTS message_attachments CASCADE');
        await query('DROP TABLE IF EXISTS messages CASCADE');

        console.log('Recreating messages table...');
        const sql = `
            CREATE TABLE messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                sender_id UUID NOT NULL,
                sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('employee', 'student')),
                recipient_id UUID NOT NULL,
                recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('employee', 'student')),
                subject VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                is_starred BOOLEAN DEFAULT FALSE,
                is_deleted_by_sender BOOLEAN DEFAULT FALSE,
                is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
                read_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_messages_recipient ON messages(recipient_id, recipient_type) WHERE is_deleted_by_recipient = FALSE;
            CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type) WHERE is_deleted_by_sender = FALSE;
            CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
            CREATE INDEX idx_messages_unread ON messages(recipient_id) WHERE is_read = FALSE AND is_deleted_by_recipient = FALSE;

            CREATE OR REPLACE FUNCTION update_messages_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trigger_update_messages_updated_at
                BEFORE UPDATE ON messages
                FOR EACH ROW
                EXECUTE FUNCTION update_messages_updated_at();
        `;

        await query(sql);

        console.log('✅ Messages table recreated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to recreate table:', error);
        process.exit(1);
    }
}

recreateMessagesTable();
