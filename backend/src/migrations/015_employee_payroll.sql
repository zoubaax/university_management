-- Migration: Add Payroll & Employee Salary Columns
-- Description: Adds salary fields to employees and creates a payroll tracking table.

-- 1. Add salary columns to employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS base_salary DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS deduction_per_absence DECIMAL(10, 2) DEFAULT 0.00;

-- 2. Create Payroll Table
CREATE TABLE IF NOT EXISTS employee_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    base_salary DECIMAL(10, 2) NOT NULL,
    total_absences INT DEFAULT 0,
    total_deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'PAID')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_payroll_month ON employee_payroll(month);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON employee_payroll(employee_id);
