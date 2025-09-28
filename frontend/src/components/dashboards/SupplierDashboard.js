import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PaymentDropdown from '../PaymentDropdown';
import '../../styles/Dashboard.css';

const SupplierDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || ''
    });

    const [stats, setStats] = useState({
        totalDeliveries: 0,
        pendingDeliveries: 0,
        completedDeliveries: 0,
        totalRevenue: 0
    });

    // Deliveries Data
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch deliveries assigned to this supplier
    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/delivery/supplier', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setDeliveries(data.data.deliveries);
                
                // Update stats based on deliveries
                const total = data.data.deliveries.length;
                const pending = data.data.deliveries.filter(d => d.payment_status === 'pending').length;
                const completed = data.data.deliveries.filter(d => d.payment_status === 'paid').length;
                
                setStats({
                    totalDeliveries: total,
                    pendingDeliveries: pending,
                    completedDeliveries: completed,
                    totalRevenue: 0 // Calculate based on delivery amounts if available
                });
            } else {
                setError(data.message || 'Failed to fetch deliveries');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            setError('Failed to fetch deliveries');
        } finally {
            setLoading(false);
        }
    };

    // Accept delivery with payment method
    const acceptDelivery = async (deliveryId, paymentMethod) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/delivery/accept/${deliveryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ payment_method: paymentMethod })
            });

            const data = await response.json();
            if (data.success) {
                // Refresh deliveries after acceptance
                fetchDeliveries();
                alert('Delivery accepted successfully!');
            } else {
                alert(data.message || 'Failed to accept delivery');
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            alert('Failed to accept delivery');
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'in-progress': return '#3b82f6';
            case 'completed': 
            case 'delivered':
            case 'paid': return '#10b981';
            case 'spot': return '#10b981';
            case 'monthly': return '#3b82f6';
            case 'cancelled': return '#ef4444';
            case 'urgent': return '#dc2626';
            case 'high': return '#f59e0b';
            case 'normal': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStockStatus = (status) => {
        switch (status) {
            case 'in-stock': return '#10b981';
            case 'low-stock': return '#f59e0b';
            case 'out-of-stock': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        // Here you would typically make an API call to update the profile
        alert('Profile updated successfully!');
        setShowEditProfile(false);
    };

    const markMessageAsRead = (messageId) => {
        // Here you would typically make an API call to mark message as read
        console.log('Marking message as read:', messageId);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        {/* Statistics Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🚚</div>
                                <div className="stat-info">
                                    <h3>{stats.totalDeliveries}</h3>
                                    <p>Total Deliveries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <h3>{stats.pendingDeliveries}</h3>
                                    <p>Pending Deliveries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <h3>{stats.completedDeliveries}</h3>
                                    <p>Completed Deliveries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>${stats.totalRevenue.toLocaleString()}</h3>
                                    <p>Total Revenue</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Deliveries */}
                        <div className="section">
                            <h3>Recent Deliveries</h3>
                            {loading ? (
                                <div className="loading">Loading deliveries...</div>
                            ) : error ? (
                                <div className="error">{error}</div>
                            ) : (
                                <div className="table-container">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Delivery ID</th>
                                                <th>Staff</th>
                                                <th>Quantity (kg)</th>
                                                <th>Delivery Date</th>
                                                <th>Delivery Time</th>
                                                <th>Payment Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliveries.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                                        No deliveries assigned yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                deliveries.map(delivery => (
                                                    <tr key={delivery.delivery_id}>
                                                        <td><strong>#{delivery.delivery_id}</strong></td>
                                                        <td>{delivery.staff_name || 'N/A'}</td>
                                                        <td>{delivery.quantity_kg} kg</td>
                                                        <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                                                        <td>{delivery.delivery_time}</td>
                                                        <td>
                                                            <PaymentDropdown
                                                                deliveryId={delivery.delivery_id}
                                                                currentStatus={delivery.payment_status}
                                                                onStatusChange={acceptDelivery}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>


                    </>
                );

            case 'deliveries':
                return (
                    <div className="section">
                        <h3>All Deliveries</h3>
                        {loading ? (
                            <div className="loading">Loading deliveries...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            <div className="table-container">
                                <table className="deliveries-table">
                                    <thead>
                                        <tr>
                                            <th>Delivery ID</th>
                                            <th>Staff</th>
                                            <th>Quantity (kg)</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Payment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveries.map(delivery => (
                                            <tr key={delivery.delivery_id}>
                                                <td><strong>#{delivery.delivery_id}</strong></td>
                                                <td>{delivery.staff_name} ({delivery.staff_username})</td>
                                                <td>{delivery.quantity_kg}</td>
                                                <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                                                <td>{delivery.delivery_time}</td>
                                                <td>
                                                    <PaymentDropdown
                                                        deliveryId={delivery.delivery_id}
                                                        currentStatus={delivery.payment_status}
                                                        onStatusChange={acceptDelivery}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {deliveries.length === 0 && (
                                    <div className="no-data">No deliveries assigned to you yet.</div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'profile':
                return (
                    <div className="section">
                        <div className="section-header">
                            <h3>Profile Management</h3>
                            <button 
                                className="btn-primary"
                                onClick={() => setShowEditProfile(!showEditProfile)}
                            >
                                {showEditProfile ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        {showEditProfile ? (
                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary">Update Profile</button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        onClick={() => setShowEditProfile(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-display">
                                <div className="profile-info">
                                    <div className="info-group">
                                        <label>Name:</label>
                                        <span>{user?.first_name} {user?.last_name}</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Email:</label>
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Role:</label>
                                        <span className="role-badge role-supplier">Supplier</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-section">
                <h2>Supplier Dashboard</h2>
                <p>Welcome back, {user?.first_name}! Manage your supplies and business</p>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'deliveries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deliveries')}
                >
                    🚚 Deliveries
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Profile
                </button>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Quick Actions - Only show on overview tab */}
            {activeTab === 'overview' && (
                <div className="section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <div className="action-card" onClick={() => setActiveTab('deliveries')}>
                            <div className="action-icon">🚚</div>
                            <div className="action-text">
                                <h4>View Deliveries</h4>
                                <p>Check your assigned deliveries</p>
                            </div>
                        </div>
                        <div className="action-card" onClick={() => setActiveTab('profile')}>
                            <div className="action-icon">👤</div>
                            <div className="action-text">
                                <h4>Profile Settings</h4>
                                <p>Update your profile information</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;