-- 1. Add pricing to specialities
ALTER TABLE specialities ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10, 2) DEFAULT 0.00;

-- 2. Add FINANCIER role if not exists
INSERT INTO roles (name, description, permissions) 
VALUES ('FINANCIER', 'Manages university finances, student payments, and scholarships', '["manage_finance", "view_all_payments", "verify_receipts", "manage_prices", "view_students", "manage_partnerships"]')
ON CONFLICT (name) DO NOTHING;

-- 3. Create Partnerships table (for the -20% discount)
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 20.00,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Student Finance Profiles
-- This tracks the payment plan, discounts, and total due
CREATE TABLE IF NOT EXISTS student_finance_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
    payment_plan VARCHAR(20) DEFAULT 'MONTHLY', -- 'FULL', 'THREE_PARTS', 'MONTHLY'
    base_amount DECIMAL(10, 2) NOT NULL,       -- Original price of the specialty
    discount_amount DECIMAL(10, 2) DEFAULT 0,  -- Total discount applied (cash/company)
    total_amount_due DECIMAL(10, 2) NOT NULL,  -- base_amount - discount_amount
    remaining_balance DECIMAL(10, 2) NOT NULL,
    is_fully_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Payments table
-- This tracks actual money coming in via Cash, Check, or Transfer
CREATE TABLE IF NOT EXISTS finance_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL, -- 'CASH', 'CHECK', 'BANK_TRANSFER'
    
    -- Check specific fields
    check_number VARCHAR(100),
    bank_name VARCHAR(100),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    
    -- External verification (Receipts for transfer)
    receipt_url TEXT,
    
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL, -- The Financier who clicked verify
    verified_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add triggers for updated_at
CREATE TRIGGER update_partnerships_modtime BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_finance_profiles_modtime BEFORE UPDATE ON student_finance_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_finance_payments_modtime BEFORE UPDATE ON finance_payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Add some default partnerships for testing
INSERT INTO partnerships (company_name, discount_percentage) VALUES 
('Global Tech Corp', 20.00),
('EduConnect Ltd', 15.00)
ON CONFLICT (company_name) DO NOTHING;
