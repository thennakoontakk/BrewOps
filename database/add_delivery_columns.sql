-- Add new columns to delivery table
USE brewops;

-- Add supplier_accepted column (boolean to track if supplier accepted the delivery)
ALTER TABLE delivery ADD COLUMN supplier_accepted BOOLEAN DEFAULT FALSE;

-- Add staff_received column (boolean to track if staff marked the delivery as received)
ALTER TABLE delivery ADD COLUMN staff_received BOOLEAN DEFAULT FALSE;

-- Add indexes for the new columns for better query performance
CREATE INDEX idx_delivery_supplier_accepted ON delivery(supplier_accepted);
CREATE INDEX idx_delivery_staff_received ON delivery(staff_received);