import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const UserManagement = () => {
    // Updated component with dashboard table styles
    // Green theme user management component
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminCount: 0,
        managerCount: 0,
        supplierCount: 0,
        staffCount: 0
    });

    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users');
            const userData = response.data.data.users;
            setUsers(userData);
            
            // Calculate stats
            const stats = {
                totalUsers: userData.length,
                activeUsers: userData.filter(user => user.is_active).length,
                adminCount: userData.filter(user => user.role_name === 'admin').length,
                managerCount: userData.filter(user => user.role_name === 'manager').length,
                supplierCount: userData.filter(user => user.role_name === 'supplier').length,
                staffCount: userData.filter(user => user.role_name === 'staff').length
            };
            setStats(stats);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/auth/roles');
            setRoles(response.data.data.roles);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/register', newUser);
            setNewUser({
                username: '',
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                roleId: ''
            });
            setShowCreateForm(false);
            fetchUsers(); // Refresh the list
            alert('User created successfully!');
        } catch (error) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await axios.patch(`/users/${userId}/role`, {
                roleId: newRoleId
            });
            fetchUsers(); // Refresh the list
            setEditingUser(null);
            alert('User role updated successfully!');
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert(error.response?.data?.message || 'Failed to update user role');
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await axios.patch(`/users/${userId}/status`, {
                isActive: !currentStatus
            });
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update user status:', error);
            alert(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`/users/${userId}`);
                fetchUsers(); // Refresh the list
                alert('User deleted successfully!');
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="loading">Loading user management...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-section">
                <h2 style={{color: "white"}}>User Management</h2>
                <p style={{color: "white"}}>Manage users, roles, and permissions</p>
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
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active Users</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👑</div>
                    <div className="stat-info">
                        <h3>{stats.adminCount}</h3>
                        <p>Administrators</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{stats.managerCount}</h3>
                        <p>Managers</p>
                    </div>
                </div>
            </div>

            {/* User Management Section */}
            <div className="section">
                <div className="section-header">
                    <h3>User Management</h3>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{
                            background: "linear-gradient(to right, #43a047, #2e7d32)",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            fontWeight: "600"
                        }}
                    >
                        {showCreateForm ? 'Cancel' : '+ Add New User'}
                    </button>
                </div>

                {/* User Creation Form */}
                {showCreateForm && (
                    <div className="form-container">
                        <h4>Create New User</h4>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input 
                                        type="text" 
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        type="text" 
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select 
                                    value={newUser.roleId}
                                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                                    required
                                >
                                    <option value="">Select a role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-success">Create User</button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users Table */}
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {editingUser === user.id ? (
                                            <select 
                                                defaultValue={user.role_id}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #2e8b57',
                                                    borderRadius: '5px',
                                                    padding: '8px 12px',
                                                    color: '#1a5928',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span 
                                                className="editable"
                                                onClick={() => setEditingUser(user.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#2e7d32',
                                                    textDecoration: 'underline',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {user.role_name.toUpperCase()}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span 
                                            className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}
                                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                                        >
                                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn"
                                                onClick={() => deleteUser(user.id)}
                                                style={{
                                                    backgroundColor: '#f44336',
                                                    color: 'white'
                                                }}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => setEditingUser(user.id)}
                                                style={{
                                                    backgroundColor: '#2e7d32',
                                                    color: 'white'
                                                }}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;