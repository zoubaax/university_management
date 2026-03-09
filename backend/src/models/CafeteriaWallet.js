const { query } = require('../config/db');

class CafeteriaWallet {
    static async getByUserId(userId) {
        let result = await query('SELECT * FROM cafeteria_wallets WHERE user_id = $1', [userId]);

        // Auto-create wallet if doesn't exist
        if (result.rows.length === 0) {
            result = await query(
                'INSERT INTO cafeteria_wallets (user_id, balance) VALUES ($1, 0.00) RETURNING *',
                [userId]
            );
        }

        return result.rows[0];
    }

    static async recharge(userId, amount) {
        const result = await query(
            `INSERT INTO cafeteria_wallets (user_id, balance, last_recharge_at, updated_at)
             VALUES ($2, $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE SET 
                balance = cafeteria_wallets.balance + $1,
                last_recharge_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [amount, userId]
        );
        return result.rows[0];
    }

    static async deduct(userId, amount) {
        // Use a transaction to ensure atomic deduction
        const client = await require('../config/db').pool.connect();
        try {
            await client.query('BEGIN');

            const walletRes = await client.query('SELECT balance FROM cafeteria_wallets WHERE user_id = $1 FOR UPDATE', [userId]);

            if (walletRes.rows.length === 0) {
                throw new Error('Wallet not found');
            }

            const currentBalance = parseFloat(walletRes.rows[0].balance);
            if (currentBalance < amount) {
                throw new Error('Insufficient cafeteria wallet balance');
            }

            const result = await client.query(
                `UPDATE cafeteria_wallets 
                 SET balance = balance - $1, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2
                 RETURNING *`,
                [amount, userId]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async initTable() {
        await query(`
            CREATE TABLE IF NOT EXISTS cafeteria_wallets (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                balance DECIMAL(10, 2) DEFAULT 0.00,
                last_recharge_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
}

module.exports = CafeteriaWallet;
