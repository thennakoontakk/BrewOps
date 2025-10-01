import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import DashboardCharts from '../DashboardCharts';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        tasksCompleted: 12,
        tasksInProgress: 5,
        totalTasks: 17,
        hoursWorked: 38
    });

    // Supplier management state
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierForm, setSupplierForm] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isActive: true
    });

    // Delivery management state
    const [deliveries, setDeliveries] = useState([]);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [deliveryForm, setDeliveryForm] = useState({
        supplier_id: '',
        quantity_kg: '',
        delivery_date: '',
        delivery_time: '',
        payment_status: 'Pending'
    });

    // Inventory state
    const [inventoryData, setInventoryData] = useState({
        totalQuantity: 0,
        recentDeliveries: 0,
        pendingDeliveries: 0,
        loading: false
    });

    const [activeTab, setActiveTab] = useState('overview');

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/suppliers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setSuppliers(data.data.suppliers);
            } else {
                setError(data.message || 'Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setError('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    // Create supplier
    const createSupplier = async (supplierData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: supplierData.username,
                    email: supplierData.email,
                    password: supplierData.password,
                    firstName: supplierData.firstName,
                    lastName: supplierData.lastName,
                    isActive: supplierData.isActive
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowSupplierModal(false);
                resetSupplierForm();
                fetchSuppliers(); // Refresh the list
                setError('');
            } else {
                setError(data.message || 'Failed to create supplier');
            }
        } catch (error) {
            console.error('Error creating supplier:', error);
            setError('Failed to create supplier');
        }
    };

    // Delivery management functions
    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/delivery', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setDeliveries(data.data.deliveries);
                calculateInventoryData(data.data.deliveries);
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

    // Calculate inventory data from deliveries
    const calculateInventoryData = (deliveriesData) => {
        setInventoryData(prev => ({ ...prev, loading: true }));
        
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
            }).length;
            
            // Calculate pending deliveries
            const pendingDeliveries = deliveriesData.filter(delivery => 
                delivery.payment_status === 'Pending'
            ).length;
            
            setInventoryData({
                totalQuantity: totalQuantity,
                recentDeliveries: recentDeliveries,
                pendingDeliveries: pendingDeliveries,
                loading: false
            });
        } catch (error) {
            console.error('Error calculating inventory data:', error);
            setInventoryData(prev => ({ ...prev, loading: false }));
        }
    };

    const createDelivery = async (deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/delivery', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryData)
            });

            const data = await response.json();
            if (data.success) {
                setShowDeliveryModal(false);
                resetDeliveryForm();
                fetchDeliveries();
                setError('');
            } else {
                setError(data.message || 'Failed to create delivery');
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            setError('Failed to create delivery');
        }
    };

    const updateDelivery = async (deliveryId, deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/delivery/${deliveryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryData)
            });

            const data = await response.json();
            if (data.success) {
                setShowDeliveryModal(false);
                setEditingDelivery(null);
                resetDeliveryForm();
                fetchDeliveries();
                setError('');
            } else {
                setError(data.message || 'Failed to update delivery');
            }
        } catch (error) {
            console.error('Error updating delivery:', error);
            setError('Failed to update delivery');
        }
    };

    const deleteDelivery = async (deliveryId) => {
        if (!window.confirm('Are you sure you want to delete this delivery?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/delivery/${deliveryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                fetchDeliveries();
                setError('');
            } else {
                setError(data.message || 'Failed to delete delivery');
            }
        } catch (error) {
            console.error('Error deleting delivery:', error);
            setError('Failed to delete delivery');
        }
    };

    const canModifyDelivery = (createdAt) => {
        const now = new Date();
        const deliveryTime = new Date(createdAt);
        const timeDifference = (now - deliveryTime) / (1000 * 60); // difference in minutes
        return timeDifference <= 10;
    };

    // Update supplier
    const updateSupplier = async (id, supplierData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            const data = await response.json();
            if (data.success) {
                fetchSuppliers();
                setShowSupplierModal(false);
                setEditingSupplier(null);
                resetSupplierForm();
                setError('');
            } else {
                setError(data.message || 'Failed to update supplier');
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            setError('Failed to update supplier');
        }
    };

    // Delete supplier
    const deleteSupplier = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                fetchSuppliers();
                setError('');
            } else {
                setError(data.message || 'Failed to delete supplier');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            setError('Failed to delete supplier');
        }
    };

    // Toggle supplier status
    const toggleSupplierStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/suppliers/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await response.json();
            if (data.success) {
                fetchSuppliers();
                setError('');
            } else {
                setError(data.message || 'Failed to update supplier status');
            }
        } catch (error) {
            console.error('Error updating supplier status:', error);
            setError('Failed to update supplier status');
        }
    };

    // Form handlers
    const resetSupplierForm = () => {
        setSupplierForm({
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            isActive: true
        });
    };

    const resetDeliveryForm = () => {
        setDeliveryForm({
            supplier_id: '',
            quantity_kg: '',
            delivery_date: '',
            delivery_time: '',
            payment_status: 'Pending'
        });
    };

    const handleSupplierFormSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            updateSupplier(editingSupplier.id, supplierForm);
        } else {
            createSupplier(supplierForm);
        }
    };

    const handleDeliveryFormSubmit = (e) => {
        e.preventDefault();
        if (editingDelivery) {
            updateDelivery(editingDelivery.delivery_id, deliveryForm);
        } else {
            createDelivery(deliveryForm);
        }
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setSupplierForm({
            username: supplier.username,
            email: supplier.email,
            password: '', // Don't populate password for security
            firstName: supplier.first_name,
            lastName: supplier.last_name,
            isActive: supplier.is_active
        });
        setShowSupplierModal(true);
    };

    const openCreateModal = () => {
        setEditingSupplier(null);
        resetSupplierForm();
        setShowSupplierModal(true);
    };

    const openCreateDeliveryModal = () => {
        setEditingDelivery(null);
        resetDeliveryForm();
        setShowDeliveryModal(true);
    };

    const openEditDeliveryModal = (delivery) => {
        setEditingDelivery(delivery);
        setDeliveryForm({
            supplier_id: delivery.supplier_id,
            quantity_kg: delivery.quantity_kg,
            delivery_date: delivery.delivery_date,
            delivery_time: delivery.delivery_time,
            payment_status: delivery.payment_status
        });
        setShowDeliveryModal(true);
    };



    useEffect(() => {
        if (activeTab === 'suppliers') {
            fetchSuppliers();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchSuppliers();
        fetchDeliveries();
    }, []);

    return (
        <div className="dashboard-container">
            {/* Dashboard Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory
                </button>
                <button 
                    className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    Supplier Management
                </button>
                <button 
                    className={`tab-button ${activeTab === 'deliveries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deliveries')}
                >
                    Delivery Management
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{stats.tasksCompleted}</h3>
                                <p>Completed</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔄</div>
                            <div className="stat-info">
                                <h3>{stats.tasksInProgress}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>{stats.totalTasks}</h3>
                                <p>Total Tasks</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏰</div>
                            <div className="stat-info">
                                <h3>{stats.hoursWorked}h</h3>
                                <p>Hours This Week</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Analytics Charts */}
                    <DashboardCharts />

                    {/* Recent Announcements */}
                    <div className="section">
                        <h3>Recent Announcements</h3>
                        <div className="announcements">
                            <div className="announcement-item">
                                <div className="announcement-icon">📢</div>
                                <div className="announcement-content">
                                    <h4>New Safety Protocols</h4>
                                    <p>Please review the updated safety protocols in the break room.</p>
                                    <span className="announcement-time">2 days ago</span>
                                </div>
                            </div>
                            <div className="announcement-item">
                                <div className="announcement-icon">🎉</div>
                                <div className="announcement-content">
                                    <h4>Employee of the Month</h4>
                                    <p>Congratulations to Sarah for being employee of the month!</p>
                                    <span className="announcement-time">1 week ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h2>Inventory Overview</h2>
                        <p>Inventory data calculated from delivery records</p>
                    </div>

                    {inventoryData.loading ? (
                        <div className="loading">Loading inventory data...</div>
                    ) : (
                        <>
                            {/* Inventory Stats Cards */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">📦</div>
                                    <div className="stat-info">
                                        <h3>{inventoryData.totalQuantity.toFixed(2)} kg</h3>
                                        <p>Total Inventory</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🚚</div>
                                    <div className="stat-info">
                                        <h3>{inventoryData.recentDeliveries}</h3>
                                        <p>Recent Deliveries (30 days)</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">⏳</div>
                                    <div className="stat-info">
                                        <h3>{inventoryData.pendingDeliveries}</h3>
                                        <p>Pending Payments</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-info">
                                        <h3>{deliveries.length}</h3>
                                        <p>Total Deliveries</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Summary */}
                            <div className="section">
                                <h3>Inventory Summary</h3>
                                <div className="inventory-summary">
                                    <div className="summary-card">
                                        <h4>Current Stock Level</h4>
                                        <p className="summary-value">{inventoryData.totalQuantity.toFixed(2)} kg</p>
                                        <p className="summary-description">
                                            Total quantity from all recorded deliveries
                                        </p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Recent Activity</h4>
                                        <p className="summary-value">{inventoryData.recentDeliveries} deliveries</p>
                                        <p className="summary-description">
                                            Deliveries received in the last 30 days
                                        </p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Payment Status</h4>
                                        <p className="summary-value">{inventoryData.pendingDeliveries} pending</p>
                                        <p className="summary-description">
                                            Deliveries with pending payment status
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Deliveries Table */}
                            <div className="section">
                                <h3>Recent Deliveries</h3>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Supplier</th>
                                                <th>Quantity (kg)</th>
                                                <th>Payment Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliveries
                                                .sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date))
                                                .slice(0, 10)
                                                .map(delivery => (
                                                <tr key={delivery.delivery_id}>
                                                    <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                                                    <td>{delivery.supplier_name}</td>
                                                    <td>{delivery.quantity_kg}</td>
                                                    <td>
                                                        <span className={`status-badge ${delivery.payment_status.toLowerCase()}`}>
                                                            {delivery.payment_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {deliveries.length === 0 && (
                                        <div className="no-data">
                                            No delivery records found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Supplier Management Tab */}
            {activeTab === 'suppliers' && (
                <div className="section">
                    <div className="section-header">
                        <h3>Supplier Management</h3>
                        <button className="btn-primary" onClick={openCreateModal}>
                            Add New Supplier
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">Loading suppliers...</div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map(supplier => (
                                        <tr key={supplier.id}>
                                            <td>{supplier.first_name} {supplier.last_name}</td>
                                            <td>{supplier.username}</td>
                                            <td>{supplier.email}</td>
                                            <td>
                                                <span className={`status-badge ${supplier.is_active ? 'active' : 'inactive'}`}>
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{new Date(supplier.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(supplier)}
                                                        title="Edit supplier"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className={`btn-toggle ${supplier.is_active ? 'deactivate' : 'activate'}`}
                                                        onClick={() => toggleSupplierStatus(supplier.id, supplier.is_active)}
                                                        title={supplier.is_active ? 'Deactivate supplier' : 'Activate supplier'}
                                                    >
                                                        {supplier.is_active ? '🚫' : '✅'}
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => deleteSupplier(supplier.id)}
                                                        title="Delete supplier"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {suppliers.length === 0 && !loading && (
                                <div className="no-data">
                                    No suppliers found. Click "Add New Supplier" to create one.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Supplier Modal */}
            {showSupplierModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowSupplierModal(false);
                                    setEditingSupplier(null);
                                    resetSupplierForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSupplierFormSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={supplierForm.firstName}
                                        onChange={(e) => setSupplierForm({...supplierForm, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={supplierForm.lastName}
                                        onChange={(e) => setSupplierForm({...supplierForm, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={supplierForm.username}
                                        onChange={(e) => setSupplierForm({...supplierForm, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            {!editingSupplier && (
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={supplierForm.password}
                                        onChange={(e) => setSupplierForm({...supplierForm, password: e.target.value})}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={supplierForm.isActive}
                                        onChange={(e) => setSupplierForm({...supplierForm, isActive: e.target.checked})}
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowSupplierModal(false);
                                    setEditingSupplier(null);
                                    resetSupplierForm();
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deliveries Tab */}
            {activeTab === 'deliveries' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h2>Delivery Management</h2>
                        <button 
                            className="btn-primary"
                            onClick={openCreateDeliveryModal}
                        >
                            Add New Delivery
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">Loading deliveries...</div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Delivery ID</th>
                                        <th>Supplier</th>
                                        <th>Staff</th>
                                        <th>Quantity (kg)</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveries.map(delivery => (
                                        <tr key={delivery.delivery_id}>
                                            <td>{delivery.delivery_id}</td>
                                            <td>{delivery.supplier_name}</td>
                                            <td>{delivery.staff_name}</td>
                                            <td>{delivery.quantity_kg}</td>
                                            <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                                            <td>{delivery.delivery_time}</td>
                                            <td>
                                                <span className={`status-badge ${delivery.payment_status.toLowerCase()}`}>
                                                    {delivery.payment_status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {canModifyDelivery(delivery.created_at) && (
                                                        <>
                                                            <button 
                                                                className="btn-edit"
                                                                onClick={() => openEditDeliveryModal(delivery)}
                                                                title="Edit delivery"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button 
                                                                className="btn-delete"
                                                                onClick={() => deleteDelivery(delivery.delivery_id)}
                                                                title="Delete delivery"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                    {!canModifyDelivery(delivery.created_at) && (
                                                        <span className="text-muted" title="Cannot edit/delete after 10 minutes">
                                                            🔒 Locked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {deliveries.length === 0 && !loading && (
                                <div className="no-data">
                                    No deliveries found. Click "Add New Delivery" to create one.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Delivery Modal */}
            {showDeliveryModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    setEditingDelivery(null);
                                    resetDeliveryForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleDeliveryFormSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <select
                                        value={deliveryForm.supplier_id}
                                        onChange={(e) => setDeliveryForm({...deliveryForm, supplier_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.first_name} {supplier.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantity (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={deliveryForm.quantity_kg}
                                        onChange={(e) => setDeliveryForm({...deliveryForm, quantity_kg: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Delivery Date</label>
                                    <input
                                        type="date"
                                        value={deliveryForm.delivery_date}
                                        onChange={(e) => setDeliveryForm({...deliveryForm, delivery_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Delivery Time</label>
                                    <input
                                        type="time"
                                        value={deliveryForm.delivery_time}
                                        onChange={(e) => setDeliveryForm({...deliveryForm, delivery_time: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Payment Status</label>
                                    <select
                                        value={deliveryForm.payment_status}
                                        onChange={(e) => setDeliveryForm({...deliveryForm, payment_status: e.target.value})}
                                        required
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Spot Payment Pending">Spot Payment Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowDeliveryModal(false);
                                    setEditingDelivery(null);
                                    resetDeliveryForm();
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingDelivery ? 'Update Delivery' : 'Create Delivery'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier Modal */}
            {showSupplierModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowSupplierModal(false);
                                    setEditingSupplier(null);
                                    resetSupplierForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSupplierFormSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={supplierForm.firstName}
                                        onChange={(e) => setSupplierForm({...supplierForm, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={supplierForm.lastName}
                                        onChange={(e) => setSupplierForm({...supplierForm, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={supplierForm.username}
                                        onChange={(e) => setSupplierForm({...supplierForm, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            {!editingSupplier && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            value={supplierForm.password}
                                            onChange={(e) => setSupplierForm({...supplierForm, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="form-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={supplierForm.isActive}
                                        onChange={(e) => setSupplierForm({...supplierForm, isActive: e.target.checked})}
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowSupplierModal(false);
                                    setEditingSupplier(null);
                                    resetSupplierForm();
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;