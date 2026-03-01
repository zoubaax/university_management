-- Add pricing to departments (Broad pricing)
ALTER TABLE departments ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10, 2) DEFAULT 0.00;

-- Ensure specialities can override departmental pricing
-- (specialities.yearly_price was already added in 013, but let's be sure)
ALTER TABLE specialities ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10, 2) DEFAULT 0.00;
