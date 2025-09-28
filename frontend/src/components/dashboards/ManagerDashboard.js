import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalTeamMembers: 0,
        activeMembers: 0,
        supplierCount: 0,
        staffCount: 0
    });
    const [inventoryData, setInventoryData] = useState({
        totalQuantity: 0,
        recentDeliveries: [],
        pendingDeliveries: 0,
        loading: false
    });

    useEffect(() => {
        fetchUsers();
        fetchDeliveries();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users');
            const userData = response.data.data.users;
            
            // Filter out admin users for manager view
            const teamMembers = userData.filter(user => user.role_name !== 'admin');
            setUsers(teamMembers);
            
            // Calculate stats
            const stats = {
                totalTeamMembers: teamMembers.length,
                activeMembers: teamMembers.filter(user => user.is_active).length,
                supplierCount: teamMembers.filter(user => user.role_name === 'supplier').length,
                staffCount: teamMembers.filter(user => user.role_name === 'staff').length
            };
            setStats(stats);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveries = async () => {
        try {
            setInventoryData(prev => ({ ...prev, loading: true }));
            const token = localStorage.getItem('token');
            const response = await fetch('/api/delivery', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                // Calculate inventory data
                const calculatedData = calculateInventoryData(data.data.deliveries);
                setInventoryData(calculatedData);
            } else {
                console.error('Failed to fetch deliveries:', data.message);
                setInventoryData(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Failed to fetch deliveries:', error);
            setInventoryData(prev => ({ ...prev, loading: false }));
        }
    };

    const calculateInventoryData = (deliveriesData) => {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            // Calculate total quantity from all deliveries
            const totalQuantity = deliveriesData.reduce((sum, delivery) => {
                return sum + parseFloat(delivery.quantity_kg || 0);
            }, 0);
            
            // Calculate recent deliveries (last 30 days)
            const recentDeliveries = deliveriesData.filter(delivery => {
                const deliveryDate = new Date(delivery.delivery_date);
                return deliveryDate >= thirtyDaysAgo;
            });
            
            // Calculate pending deliveries
            const pendingDeliveries = deliveriesData.filter(delivery => 
                delivery.payment_status === 'Pending'
            ).length;
            
            return {
                totalQuantity: totalQuantity,
                recentDeliveries: recentDeliveries.slice(0, 10), // Show only last 10
                pendingDeliveries: pendingDeliveries,
                loading: false
            };
        } catch (error) {
            console.error('Error calculating inventory data:', error);
            return {
                totalQuantity: 0,
                recentDeliveries: [],
                pendingDeliveries: 0,
                loading: false
            };
        }
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="loading">Loading manager dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-section">
                <h2>Manager Dashboard</h2>
                <p>Manage your team and operations</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalTeamMembers}</h3>
                        <p>Team Members</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{stats.activeMembers}</h3>
                        <p>Active Members</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>{stats.supplierCount}</h3>
                        <p>Suppliers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👷</div>
                    <div className="stat-info">
                        <h3>{stats.staffCount}</h3>
                        <p>Staff Members</p>
                    </div>
                </div>
            </div>

            {/* Inventory Overview */}
            <div className="section">
                <h3>Inventory Overview</h3>
                <div className="inventory-summary">
                    <div className="summary-card">
                        <div className="summary-icon">📊</div>
                        <div className="summary-content">
                            <div className="summary-value">{inventoryData.totalQuantity}</div>
                            <div className="summary-label">Total Inventory</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon">🚚</div>
                        <div className="summary-content">
                            <div className="summary-value">{inventoryData.recentDeliveries.length}</div>
                            <div className="summary-label">Recent Deliveries</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon">⏳</div>
                        <div className="summary-content">
                            <div className="summary-value">{inventoryData.pendingDeliveries}</div>
                            <div className="summary-label">Pending Deliveries</div>
                        </div>
                    </div>
                </div>
                
                {inventoryData.loading ? (
                    <div className="loading">Loading inventory data...</div>
                ) : (
                    <div className="table-container">
                        <h4>Recent Deliveries (Last 30 Days)</h4>
                        {inventoryData.recentDeliveries.length > 0 ? (
                            <table className="deliveries-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Supplier</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryData.recentDeliveries.map(delivery => (
                                        <tr key={delivery.id}>
                                            <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                                            <td>{delivery.supplier_name || 'N/A'}</td>
                                            <td>{delivery.product_name || 'N/A'}</td>
                                            <td>{delivery.quantity_kg || 0} kg</td>
                                            <td>
                                                <span className={`status-badge ${delivery.payment_status ? delivery.payment_status.toLowerCase() : 'unknown'}`}>
                                                    {delivery.payment_status || 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">No recent deliveries found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Team Overview */}
            <div className="section">
                <h3>Team Overview</h3>
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role_name}`}>
                                            {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>




        </div>
    );
};

export default ManagerDashboard;