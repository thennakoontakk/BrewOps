const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all users (Admin and Manager only)
router.get('/', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                    u.is_active, u.created_at, r.name as role_name, r.id as role_id
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             ORDER BY u.created_at DESC`
        );

        res.json({
            success: true,
            data: {
                users
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user by ID (Admin and Manager only)
router.get('/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                    u.is_active, u.created_at, u.updated_at, r.name as role_name, r.id as role_id
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: users[0]
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update user status (Admin only)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Prevent admin from deactivating themselves
        if (req.user.id == id && !isActive) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const [result] = await pool.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;

        // Prevent admin from changing their own role
        if (req.user.id == id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Verify role exists
        const [roles] = await pool.execute(
            'SELECT id FROM roles WHERE id = ?',
            [roleId]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role selected'
            });
        }

        const [result] = await pool.execute(
            'UPDATE users SET role_id = ? WHERE id = ?',
            [roleId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.id == id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;