-- Add payment_method column to delivery table
USE brewops;
ALTER TABLE delivery ADD COLUMN payment_method VARCHAR(20) DEFAULT NULL AFTER payment_status;