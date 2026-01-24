import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import "../styles/Register.css";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">
                <div className="register-header">
                    <div className="register-logo-icon">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="register-title">Create Account</h1>
                    <p className="register-subtitle">Join SplitSmart and start splitting expenses</p>
                </div>

                <div className="register-card">
                    {error && (
                        <div className="register-error-message">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="register-form-group">
                            <label className="register-form-label">Full Name</label>
                            <div className="register-input-wrapper">
                                <User className="register-input-icon" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="register-form-input"
                                    placeholder="Eshaan Nair"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="At least 6 characters"
                                    required
                                />
                            </div>
                            <p className="register-password-hint">Must be at least 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="register-submit-btn"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="register-signin-link">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>

                <p className="register-footer-text">
                    © 2026 SplitSmart. Made with ❤️ for easy expense splitting.
                </p>
            </div>
        </div>
    );
};

export default Register;