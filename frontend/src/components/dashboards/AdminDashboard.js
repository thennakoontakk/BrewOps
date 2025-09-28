import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
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
                <div className="loading">Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-section">
                <h2>Admin Dashboard</h2>
                <p>Manage users and system settings</p>
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

            {/* User Creation Form */}
            {showCreateForm && (
                <div className="section">
                    <h3>Create New User</h3>
                    <form onSubmit={handleCreateUser} className="user-form">
                        <div className="form-row">
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
                        <div className="form-row">
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={newUser.roleId}
                                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Create User</button>
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* User Management */}
            <div className="section">
                <div className="section-header">
                    <h3>User Management</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowCreateForm(true)}
                    >
                        ➕ Add New User
                    </button>
                </div>
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
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {editingUser === user.id ? (
                                            <select
                                                value={user.role_id}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                onBlur={() => setEditingUser(null)}
                                                autoFocus
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span 
                                                className={`role-badge role-${user.role_name}`}
                                                onClick={() => setEditingUser(user.id)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to edit role"
                                            >
                                                {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                                                title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                            >
                                                {user.is_active ? '🚫' : '✅'}
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user.id)}
                                                className="action-btn edit"
                                                title="Edit Role"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="action-btn delete"
                                                title="Delete User"
                                            >
                                                🗑️
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

export default AdminDashboard;