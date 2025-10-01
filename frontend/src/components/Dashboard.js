import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import SupplierDashboard from './dashboards/SupplierDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import UserManagement from './UserManagement';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('dashboard');

    const handleLogout = () => {
        logout();
    };

    const renderContent = () => {
        if (activeNav === 'users') {
            return <UserManagement />;
        }
        
        // Only render dashboard content when on dashboard tab
        if (activeNav === 'dashboard') {
            switch (user?.role_name) {
                case 'admin':
                    return <AdminDashboard />;
                case 'manager':
                    return <ManagerDashboard />;
                case 'supplier':
                    return <SupplierDashboard />;
                case 'staff':
                    return <StaffDashboard />;
                default:
                    return (
                        <div className="dashboard-error">
                            <h2>Access Denied</h2>
                            <p>Your role is not recognized. Please contact an administrator.</p>
                        </div>
                    );
            }
        }
        
        // For other tabs that aren't implemented yet
        return (
            <div className="dashboard-section">
                <h2>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h2>
                <p>This section is under development.</p>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <h2>BrewOps</h2>
                </div>
                <nav className="sidebar-nav">
                    <div 
                        className={`sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveNav('dashboard')}
                    >
                        <span className="sidebar-nav-icon">📊</span>
                        <span>Dashboard</span>
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeNav === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveNav('users')}
                    >
                        <span className="sidebar-nav-icon">👥</span>
                        <span>User Management</span>
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeNav === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveNav('inventory')}
                    >
                        <span className="sidebar-nav-icon">📦</span>
                        <span>Inventory</span>
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeNav === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveNav('reports')}
                    >
                        <span className="sidebar-nav-icon">📝</span>
                        <span>Reports</span>
                    </div>
                </nav>
            </aside>

            <div className="dashboard-content-wrapper">
                <header className="dashboard-header">
                    <div className="header-content">
                        <div className="header-left">
                            <span className="role-badge role-{user?.role_name}">
                                {user?.role_name?.charAt(0).toUpperCase() + user?.role_name?.slice(1)}
                            </span>
                        </div>
                        <div className="header-right">
                            <div className="user-info">
                                <span className="user-name">
                                    {user?.first_name} {user?.last_name}
                                </span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="dashboard-main">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;