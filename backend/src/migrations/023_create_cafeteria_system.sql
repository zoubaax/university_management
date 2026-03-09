-- 023: Smart Cafeteria System

-- 1. Cafeteria Items (Digital Menu)
CREATE TABLE IF NOT EXISTS cafeteria_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'BREAKFAST', 'LUNCH', 'DRINKS', 'SNACKS'
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cafeteria Wallets (One per User)
CREATE TABLE IF NOT EXISTS cafeteria_wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    last_recharge_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cafeteria Orders
CREATE TABLE IF NOT EXISTS cafeteria_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'
    payment_status VARCHAR(50) DEFAULT 'PAID',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cafeteria Order Items
CREATE TABLE IF NOT EXISTS cafeteria_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES cafeteria_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES cafeteria_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add permissions to existing roles (Super Admin gets all)
INSERT INTO roles (name, description, permissions) 
VALUES ('CAFETERIA_STAFF', 'Manages the university cafeteria, menu items, and student orders.', '["manage_cafeteria"]')
ON CONFLICT (name) DO NOTHING;
