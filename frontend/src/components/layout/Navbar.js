import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Home, User, Wallet } from 'lucide-react';
import "../../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-dark">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo-section">
            <div 
              onClick={() => navigate('/dashboard')}
              className="navbar-logo-wrapper"
            >
              <div className="navbar-logo-icon">
                <Wallet/>
              </div>
              <h1 className="navbar-brand">SplitSmart</h1>
            </div>

            <nav className="navbar-nav mobile-hidden">
              <button
                onClick={() => navigate('/dashboard')}
                className={`navbar-nav-button ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <Home className="navbar-nav-icon" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`navbar-nav-button ${isActive('/profile') ? 'active' : ''}`}
              >
                <User className="navbar-nav-icon" />
                Profile
              </button>
            </nav>
          </div>

          <div className="navbar-user-section">
            <div className="navbar-user-info">
              <p className="navbar-user-name">{user.name}</p>
              <p className="navbar-user-email">{user.email}</p>
            </div>
            <div 
              onClick={() => navigate('/profile')}
              className="navbar-user-avatar"
              title={user.name}
            >
              {user.name[0]}
            </div>
            <button
              onClick={handleLogout}
              className="navbar-logout-button"
              title="Logout"
            >
              <LogOut className="navbar-logout-icon" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;