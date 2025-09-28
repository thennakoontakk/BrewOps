import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login, error, loading, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        clearError();
    }, [clearError]);

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const success = await login({ username: email, password });
        if (success) {
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
                        <p>Don't have an account yet?</p>
                        <Link to="/register" className="register-link-button">
                            Register here
                        </Link>
                    </div>
                    <img 
                        src="/login_image.png" 
                        alt="Login illustration" 
                        className="auth-illustration"
                    />
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h2>Log In</h2>
                        </div>

                        <form className="auth-form" onSubmit={onSubmit}>
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    placeholder="Username or Email"
                                />
                            </div>

                            <div className="form-group">
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        required
                                        placeholder="••••••"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember Me
                                </label>
                                <Link to="/forgot-password" className="forgot-password">
                                    Forgot your password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </button>


                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;