import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        roleId: ''
    });
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const { register, isAuthenticated, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Fetch roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/auth/roles');
                setRoles(response.data.data.roles);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            }
        };

        fetchRoles();
        clearError();
    }, [clearError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // Username validation
        if (!formData.username) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Name validation
        if (!formData.firstName) {
            errors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
            errors.firstName = 'First name can only contain letters and spaces';
        }

        if (!formData.lastName) {
            errors.lastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            errors.lastName = 'Last name can only contain letters and spaces';
        }

        // Role validation
        if (!formData.roleId) {
            errors.roleId = 'Please select a role';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const { confirmPassword, ...registrationData } = formData;
        const result = await register(registrationData);
        
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-split">
                {/* Left Side - Welcome Section */}
                <div className="auth-left">
                    <div className="auth-welcome">
                        <h1>BrewOps</h1>
                        <p>Already have an account?</p>
                        <Link to="/login" className="register-link-button">
                            Login here
                        </Link>
                    </div>
                    <img 
                        src="/login_image.png" 
                        alt="Register illustration" 
                        className="auth-illustration"
                    />
                </div>

                {/* Right Side - Register Form */}
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h2>Create Account</h2>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        placeholder="First Name"
                                        disabled={loading}
                                    />
                                    {validationErrors.firstName && (
                                        <span className="field-error">{validationErrors.firstName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Last Name"
                                        disabled={loading}
                                    />
                                    {validationErrors.lastName && (
                                        <span className="field-error">{validationErrors.lastName}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Username"
                                    disabled={loading}
                                />
                                {validationErrors.username && (
                                    <span className="field-error">{validationErrors.username}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Email"
                                    disabled={loading}
                                />
                                {validationErrors.email && (
                                    <span className="field-error">{validationErrors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <select
                                    id="roleId"
                                    name="roleId"
                                    value={formData.roleId}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select your role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.roleId && (
                                    <span className="field-error">{validationErrors.roleId}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <span className="field-error">{validationErrors.password}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <div className="password-input-container">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm Password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <span className="field-error">{validationErrors.confirmPassword}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;