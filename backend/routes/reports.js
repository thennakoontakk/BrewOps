const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get tea business data for charts
router.get('/delivery-stats', authenticateToken, async (req, res) => {
    try {
        // Get monthly tea delivery totals for the current year
        const monthlyQuery = `
            SELECT 
                MONTH(delivery_date) as month,
                SUM(quantity_kg) as total_quantity
            FROM 
                delivery
            WHERE 
                YEAR(delivery_date) = YEAR(CURRENT_DATE())
                AND is_deleted = FALSE
            GROUP BY 
                MONTH(delivery_date)
            ORDER BY 
                month ASC
        `;
        
        // Get top tea suppliers performance data
        const supplierQuery = `
            SELECT 
                u.username as supplier_name,
                COUNT(d.delivery_id) as delivery_count,
                SUM(d.quantity_kg) as total_quantity,
                AVG(d.quantity_kg) as avg_quantity_per_delivery
            FROM 
                delivery d
                JOIN users u ON d.supplier_id = u.id
            WHERE 
                d.is_deleted = FALSE
                AND u.role_id = (SELECT id FROM roles WHERE name = 'supplier')
            GROUP BY 
                d.supplier_id
            ORDER BY 
                total_quantity DESC
            LIMIT 5
        `;

        // Get payment status distribution
        const paymentStatusQuery = `
            SELECT 
                payment_status,
                COUNT(*) as count,
                SUM(quantity_kg) as total_quantity
            FROM 
                delivery
            WHERE 
                is_deleted = FALSE
            GROUP BY 
                payment_status
        `;

        // Get staff performance (who received most deliveries)
        const staffPerformanceQuery = `
            SELECT 
                u.username as staff_name,
                COUNT(d.delivery_id) as delivery_count,
                SUM(d.quantity_kg) as total_quantity
            FROM 
                delivery d
                JOIN users u ON d.staff_id = u.id
            WHERE 
                d.is_deleted = FALSE
                AND u.role_id = (SELECT id FROM roles WHERE name = 'staff')
            GROUP BY 
                d.staff_id
            ORDER BY 
                delivery_count DESC
            LIMIT 5
        `;

        // Get recent tea deliveries
        const recentQuery = `
            SELECT 
                d.delivery_id,
                supplier.username as supplier_name,
                staff.username as staff_name,
                d.quantity_kg,
                d.delivery_date,
                d.payment_status
            FROM 
                delivery d
                JOIN users supplier ON d.supplier_id = supplier.id
                JOIN users staff ON d.staff_id = staff.id
            WHERE 
                d.is_deleted = FALSE
            ORDER BY 
                d.delivery_date DESC
            LIMIT 10
        `;

        const [monthlyData] = await pool.query(monthlyQuery);
        const [supplierData] = await pool.query(supplierQuery);
        const [paymentStatusData] = await pool.query(paymentStatusQuery);
        const [staffPerformanceData] = await pool.query(staffPerformanceQuery);
        const [recentDeliveries] = await pool.query(recentQuery);

        res.json({
            monthlyData,
            supplierData,
            paymentStatusData,
            staffPerformanceData,
            recentDeliveries
        });
    } catch (error) {
        console.error('Error fetching tea business report data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;