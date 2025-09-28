const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Helper function to check if delivery can be edited/deleted (within 10 minutes)
const canModifyDelivery = (createdAt) => {
    const now = new Date();
    const deliveryTime = new Date(createdAt);
    const timeDifference = (now - deliveryTime) / (1000 * 60); // difference in minutes
    return timeDifference <= 10;
};

// Get deliveries for supplier (Supplier only)
router.get('/supplier', authenticateToken, authorizeRoles('supplier'), async (req, res) => {
    try {
        const supplierId = req.user.id;

        const [deliveries] = await pool.execute(`
            SELECT 
                d.delivery_id,
                d.supplier_id,
                d.staff_id,
                d.quantity_kg,
                d.delivery_date,
                d.delivery_time,
                d.payment_status,
                d.is_deleted,
                d.created_at,
                d.updated_at,
                CONCAT(st.first_name, ' ', st.last_name) as staff_name,
                st.username as staff_username
            FROM delivery d
            LEFT JOIN users st ON d.staff_id = st.id AND st.role_id = 4
            WHERE d.supplier_id = ? AND d.is_deleted = FALSE
            ORDER BY d.created_at DESC
        `, [supplierId]);

        res.json({
            success: true,
            data: {
                deliveries
            }
        });
    } catch (error) {
        console.error('Get supplier deliveries error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all deliveries (Staff only)
router.get('/', authenticateToken, authorizeRoles('staff', 'admin', 'manager'), async (req, res) => {
    try {
        const [deliveries] = await pool.execute(`
            SELECT 
                d.delivery_id,
                d.supplier_id,
                d.staff_id,
                d.quantity_kg,
                d.delivery_date,
                d.delivery_time,
                d.payment_status,
                d.is_deleted,
                d.created_at,
                d.updated_at,
                CONCAT(s.first_name, ' ', s.last_name) as supplier_name,
                s.username as supplier_username,
                CONCAT(st.first_name, ' ', st.last_name) as staff_name,
                st.username as staff_username
            FROM delivery d
            LEFT JOIN users s ON d.supplier_id = s.id AND s.role_id = 3
            LEFT JOIN users st ON d.staff_id = st.id AND st.role_id = 4
            WHERE d.is_deleted = FALSE
            ORDER BY d.created_at DESC
        `);

        res.json({
            success: true,
            data: {
                deliveries
            }
        });
    } catch (error) {
        console.error('Get deliveries error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get delivery by ID (Staff only)
router.get('/:id', authenticateToken, authorizeRoles('staff', 'admin', 'manager'), async (req, res) => {
    try {
        const { id } = req.params;

        const [deliveries] = await pool.execute(`
            SELECT 
                d.delivery_id,
                d.supplier_id,
                d.staff_id,
                d.quantity_kg,
                d.delivery_date,
                d.delivery_time,
                d.payment_status,
                d.is_deleted,
                d.created_at,
                d.updated_at,
                CONCAT(s.first_name, ' ', s.last_name) as supplier_name,
                s.username as supplier_username,
                CONCAT(st.first_name, ' ', st.last_name) as staff_name,
                st.username as staff_username
            FROM delivery d
            LEFT JOIN users s ON d.supplier_id = s.id AND s.role_id = 3
            LEFT JOIN users st ON d.staff_id = st.id AND st.role_id = 4
            WHERE d.delivery_id = ? AND d.is_deleted = FALSE
        `, [id]);

        if (deliveries.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        res.json({
            success: true,
            data: {
                delivery: deliveries[0]
            }
        });
    } catch (error) {
        console.error('Get delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create new delivery (Staff only)
router.post('/', 
    authenticateToken, 
    authorizeRoles('staff', 'admin', 'manager'),
    [
        body('supplier_id').isInt({ min: 1 }).withMessage('Valid supplier ID is required'),
        body('quantity_kg').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
        body('delivery_date').isDate().withMessage('Valid delivery date is required'),
        body('delivery_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid delivery time is required (HH:MM format)'),
        body('payment_status').optional().isIn(['Pending', 'Spot Payment Pending', 'Paid', 'Processing']).withMessage('Invalid payment status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { supplier_id, quantity_kg, delivery_date, delivery_time, payment_status = 'Pending' } = req.body;
            const staff_id = req.user.id; // Get staff ID from authenticated user

            // Verify supplier exists and has supplier role
            const [suppliers] = await pool.execute(
                'SELECT id FROM users WHERE id = ? AND role_id = 3 AND is_active = TRUE',
                [supplier_id]
            );

            if (suppliers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID or supplier is inactive'
                });
            }

            // Create delivery
            const [result] = await pool.execute(`
                INSERT INTO delivery (supplier_id, staff_id, quantity_kg, delivery_date, delivery_time, payment_status) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [supplier_id, staff_id, quantity_kg, delivery_date, delivery_time, payment_status]);

            res.status(201).json({
                success: true,
                message: 'Delivery created successfully',
                data: {
                    delivery_id: result.insertId
                }
            });
        } catch (error) {
            console.error('Create delivery error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Update delivery (Staff only - within 10 minutes)
router.put('/:id',
    authenticateToken,
    authorizeRoles('staff', 'admin', 'manager'),
    [
        body('supplier_id').isInt({ min: 1 }).withMessage('Valid supplier ID is required'),
        body('quantity_kg').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
        body('delivery_date').isDate().withMessage('Valid delivery date is required'),
        body('delivery_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid delivery time is required (HH:MM format)'),
        body('payment_status').optional().isIn(['Pending', 'Spot Payment Pending', 'Paid', 'Processing']).withMessage('Invalid payment status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { supplier_id, quantity_kg, delivery_date, delivery_time, payment_status } = req.body;

            // Check if delivery exists and get creation time
            const [existingDeliveries] = await pool.execute(
                'SELECT delivery_id, created_at, staff_id FROM delivery WHERE delivery_id = ? AND is_deleted = FALSE',
                [id]
            );

            if (existingDeliveries.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Delivery not found'
                });
            }

            const delivery = existingDeliveries[0];

            // Check if delivery can be modified (within 10 minutes)
            if (!canModifyDelivery(delivery.created_at)) {
                return res.status(403).json({
                    success: false,
                    message: 'Delivery can only be edited within 10 minutes of creation'
                });
            }

            // Verify supplier exists and has supplier role
            const [suppliers] = await pool.execute(
                'SELECT id FROM users WHERE id = ? AND role_id = 3 AND is_active = TRUE',
                [supplier_id]
            );

            if (suppliers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID or supplier is inactive'
                });
            }

            // Update delivery
            const [result] = await pool.execute(`
                UPDATE delivery 
                SET supplier_id = ?, quantity_kg = ?, delivery_date = ?, delivery_time = ?, payment_status = ?, updated_at = NOW()
                WHERE delivery_id = ?
            `, [supplier_id, quantity_kg, delivery_date, delivery_time, payment_status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Delivery not found'
                });
            }

            res.json({
                success: true,
                message: 'Delivery updated successfully'
            });
        } catch (error) {
            console.error('Update delivery error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Delete delivery (Staff only - within 10 minutes)
router.delete('/:id', authenticateToken, authorizeRoles('staff', 'admin', 'manager'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if delivery exists and get creation time
        const [existingDeliveries] = await pool.execute(
            'SELECT delivery_id, created_at, staff_id FROM delivery WHERE delivery_id = ? AND is_deleted = FALSE',
            [id]
        );

        if (existingDeliveries.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        const delivery = existingDeliveries[0];

        // Check if delivery can be modified (within 10 minutes)
        if (!canModifyDelivery(delivery.created_at)) {
            return res.status(403).json({
                success: false,
                message: 'Delivery can only be deleted within 10 minutes of creation'
            });
        }

        // Soft delete the delivery
        const [result] = await pool.execute(
            'UPDATE delivery SET is_deleted = TRUE, updated_at = NOW() WHERE delivery_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        res.json({
            success: true,
            message: 'Delivery deleted successfully'
        });
    } catch (error) {
        console.error('Delete delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Accept delivery with payment method (Supplier only)
router.put('/accept/:id', 
    authenticateToken, 
    authorizeRoles('supplier'),
    [
        body('payment_method').isIn(['spot', 'monthly']).withMessage('Payment method must be either "spot" or "monthly"')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { payment_method } = req.body;
            const supplierId = req.user.id;

            // Check if delivery exists and belongs to the supplier
            const [existingDeliveries] = await pool.execute(
                'SELECT delivery_id, supplier_id, payment_status FROM delivery WHERE delivery_id = ? AND supplier_id = ? AND is_deleted = FALSE',
                [id, supplierId]
            );

            if (existingDeliveries.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Delivery not found or not assigned to you'
                });
            }

            const delivery = existingDeliveries[0];

            // Check if delivery is already accepted
            if (delivery.payment_status === 'spot' || delivery.payment_status === 'monthly') {
                return res.status(400).json({
                    success: false,
                    message: 'Delivery has already been accepted'
                });
            }

            // Update delivery with payment method and set status based on payment method
            const paymentStatus = payment_method === 'spot' ? 'spot' : 'monthly';
            const [result] = await pool.execute(`
                UPDATE delivery 
                SET payment_status = ?, payment_method = ?, updated_at = NOW()
                WHERE delivery_id = ?
            `, [paymentStatus, payment_method, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to accept delivery'
                });
            }

            res.json({
                success: true,
                message: 'Delivery accepted successfully',
                data: {
                    delivery_id: id,
                    payment_method: payment_method,
                    payment_status: paymentStatus
                }
            });
        } catch (error) {
            console.error('Accept delivery error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

module.exports = router;