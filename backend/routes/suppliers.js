const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all suppliers (Admin and Staff only)
router.get('/', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const [suppliers] = await pool.execute(
            `SELECT id, username, email, first_name, last_name, 
                    is_active, created_at, updated_at
             FROM users 
             WHERE role_id = 3
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: {
                suppliers
            }
        });
    } catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get supplier by ID (Admin and Staff only)
router.get('/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const { id } = req.params;

        const [suppliers] = await pool.execute(
            `SELECT id, username, email, first_name, last_name, 
                    is_active, created_at, updated_at
             FROM users 
             WHERE id = ? AND role_id = 3`,
            [id]
        );

        if (suppliers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            data: {
                supplier: suppliers[0]
            }
        });
    } catch (error) {
        console.error('Get supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create new supplier (Admin and Staff only)
router.post('/', 
    authenticateToken, 
    authorizeRoles('admin', 'staff'),
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
        body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
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

            const { username, email, password, firstName, lastName } = req.body;

            // Check if username already exists
            const [existingUsers] = await pool.execute(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Get supplier role ID (role_id = 3 for supplier)
            const supplierRoleId = 3;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create supplier
            const [result] = await pool.execute(
                `INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, firstName, lastName, supplierRoleId, true]
            );

            res.status(201).json({
                success: true,
                message: 'Supplier created successfully',
                data: {
                    supplierId: result.insertId
                }
            });
        } catch (error) {
            console.error('Create supplier error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Update supplier (Admin and Staff only)
router.put('/:id',
    authenticateToken,
    authorizeRoles('admin', 'staff'),
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
        body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
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
            const { username, email, firstName, lastName, isActive } = req.body;

            // Check if supplier exists
            const [existingSuppliers] = await pool.execute(
                `SELECT id FROM users 
                 WHERE id = ? AND role_id = 3`,
                [id]
            );

            if (existingSuppliers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }

            // Check if username or email already exists (excluding current supplier)
            const [duplicateUsers] = await pool.execute(
                'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
                [username, email, id]
            );

            if (duplicateUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Update supplier
            const [result] = await pool.execute(
                `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, is_active = ?, updated_at = NOW()
                 WHERE id = ?`,
                [username, email, firstName, lastName, isActive !== undefined ? isActive : true, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }

            res.json({
                success: true,
                message: 'Supplier updated successfully'
            });
        } catch (error) {
            console.error('Update supplier error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Update supplier status (Admin and Staff only)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Check if supplier exists
        const [existingSuppliers] = await pool.execute(
            `SELECT id FROM users 
             WHERE id = ? AND role_id = 3`,
            [id]
        );

        if (existingSuppliers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        const [result] = await pool.execute(
            'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            message: `Supplier ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Update supplier status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete supplier (Admin and Staff only)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if supplier exists
        const [existingSuppliers] = await pool.execute(
            `SELECT id FROM users 
             WHERE id = ? AND role_id = 3`,
            [id]
        );

        if (existingSuppliers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        console.error('Delete supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;