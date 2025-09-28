import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import SupplierDashboard from './dashboards/SupplierDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const renderDashboard = () => {
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
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>BrewOps</h1>
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
                {renderDashboard()}
            </main>
        </div>
    );
};

export default Dashboard;