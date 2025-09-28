import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    Loading...
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    maxWidth: '500px'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem' }}>Access Denied</h2>
                    <p style={{ margin: '0 0 2rem 0', fontSize: '1.1rem', opacity: 0.9 }}>
                        You don't have permission to access this page.
                    </p>
                    <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', opacity: 0.7 }}>
                        Your role: <strong>{user.role_name}</strong><br />
                        Required roles: <strong>{allowedRoles.join(', ')}</strong>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 15px rgba(238, 90, 36, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Render the protected component if all checks pass
    return children;
};

export default ProtectedRoute;