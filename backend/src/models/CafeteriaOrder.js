const { query } = require('../config/db');

class CafeteriaOrder {
    static async create(data) {
        const { user_id, items, total_amount, notes, status } = data;

        const client = await require('../config/db').pool.connect();
        try {
            await client.query('BEGIN');

            const orderResult = await client.query(
                `INSERT INTO cafeteria_orders (user_id, total_amount, status, payment_status, notes)
                 VALUES ($1, $2, $3, 'PAID', $4)
                 RETURNING *`,
                [user_id, total_amount, status || 'PENDING', notes]
            );
            const order = orderResult.rows[0];

            for (const item of items) {
                await client.query(
                    `INSERT INTO cafeteria_order_items (order_id, item_id, quantity, unit_price, subtotal)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [order.id, item.item_id, item.quantity, item.unit_price, item.subtotal]
                );
            }

            await client.query('COMMIT');
            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findAll(filters = {}) {
        const { status, user_id } = filters;
        let queryStr = `
            SELECT o.*, 
                   u.email, 
                   COALESCE(e.first_name, s.first_name) as first_name,
                   COALESCE(e.last_name, s.last_name) as last_name
            FROM cafeteria_orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            if (Array.isArray(status)) {
                queryStr += ` AND status IN (${status.map((_, i) => `$${params.length + i + 1}`).join(', ')})`;
                params.push(...status);
            } else {
                params.push(status);
                queryStr += ` AND status = $${params.length}`;
            }
        }
        if (user_id) {
            params.push(user_id);
            queryStr += ` AND user_id = $${params.length}`;
        }

        queryStr += ' ORDER BY o.created_at DESC';

        const result = await query(queryStr, params);
        return result.rows;
    }

    static async findById(id) {
        const orderRes = await query(`
            SELECT o.*, 
                   COALESCE(e.first_name, s.first_name) as first_name,
                   COALESCE(e.last_name, s.last_name) as last_name
            FROM cafeteria_orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE o.id = $1
        `, [id]);

        if (orderRes.rows.length === 0) return null;
        const order = orderRes.rows[0];

        const itemsRes = await query(`
            SELECT oi.*, ci.name as item_name, ci.image_url
            FROM cafeteria_order_items oi
            JOIN cafeteria_items ci ON oi.item_id = ci.id
            WHERE oi.order_id = $1
        `, [id]);

        order.items = itemsRes.rows;
        return order;
    }

    static async updateStatus(id, status) {
        const result = await query(
            'UPDATE cafeteria_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }

    static async initTable() {
        // Orders Header
        await query(`
            CREATE TABLE IF NOT EXISTS cafeteria_orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                payment_status VARCHAR(50) DEFAULT 'PAID',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Order Items
        await query(`
            CREATE TABLE IF NOT EXISTS cafeteria_order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES cafeteria_orders(id) ON DELETE CASCADE,
                item_id UUID REFERENCES cafeteria_items(id) ON DELETE SET NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                unit_price DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
}

module.exports = CafeteriaOrder;
