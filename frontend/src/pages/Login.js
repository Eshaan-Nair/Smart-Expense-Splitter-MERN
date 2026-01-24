import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import "../styles/Login.css";
import "../styles/Register.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <div className="logo-icon">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="login-title">Welcome Back!</h1>
                    <p className="login-subtitle">Sign in to continue to SplitSmart</p>
                </div>

                <div className="login-card">
                    {error && (
                        <div className="error-message">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="register-form-group">
                            <label className="register-form-label">Email Address</label>
                            <div className="register-input-wrapper">
                                <Mail className="register-input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="register-form-input"
                                    placeholder="eshaan@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-form-group">
                            <label className="register-form-label">Password</label>
                            <div className="register-input-wrapper">
                                <Lock className="register-input-icon" />
                                <input
                                    type="password"
                                     value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="register-form-input"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="signup-link">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register">Sign up</Link>
                        </p>
                    </div>
                </div>

                <p className="footer-text">
                    © 2026 SplitSmart. Made with ❤️ for easy expense splitting.
                </p>
            </div>
        </div>
    );
};

export default Login;