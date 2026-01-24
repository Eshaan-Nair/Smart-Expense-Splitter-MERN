import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BanknoteArrowUp, BanknoteArrowDown, HandCoins, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [balanceRes, groupsRes] = await Promise.all([
        API.get('/settlements/user'),
        API.get('/groups')
      ]);

      let allExpenses = [];
      if (groupsRes.data.groups.length > 0) {
        const expensePromises = groupsRes.data.groups.map(group =>
          API.get(`/expenses/group/${group._id}`)
        );
        const expenseResponses = await Promise.all(expensePromises);
        allExpenses = expenseResponses.flatMap(res => res.data.expenses);
      }

      const categoryTotals = {};
      const monthlyTotals = {};
      let totalSpent = 0;

      allExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;

        const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0;
        }
        monthlyTotals[month] += expense.amount;

        if (expense.paidBy._id === user.id) {
          totalSpent += expense.amount;
        }
      });

      setAnalytics({
        balance: balanceRes.data.summary,
        categoryTotals,
        monthlyTotals,
        totalExpenses: allExpenses.length,
        totalSpent,
        groupCount: groupsRes.data.groups.length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await API.put('/auth/update-profile', { name, email });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Profile updated successfully');
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  const categoryColors = {
    Food: '#10b981',
    Transport: '#3b82f6',
    Shopping: '#8b5cf6',
    Entertainment: '#f59e0b',
    Bills: '#ef4444',
    Other: '#6b7280'
  };

  const categoryData = Object.entries(analytics.categoryTotals || {}).sort((a, b) => b[1] - a[1]);
  const totalCategorySpending = Object.values(analytics.categoryTotals || {}).reduce((sum, val) => sum + val, 0);

  return (
    <div className="profile-page-container">
      <Navbar />

      <div className="profile-page-content">
        <h1 className="profile-page-title">My Profile</h1>

        <div className="profile-grid">
          {/* Profile Info Card */}
          <div>
            <div className="profile-info-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">{user.name[0]}</div>
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
              </div>

              {!editMode ? (
                <div className="profile-actions">
                  <button onClick={() => setEditMode(true)} className="profile-btn profile-btn-primary">
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="profile-btn profile-btn-danger"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="profile-form-input"
                      required
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-form-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="profile-form-input"
                      required
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button
                      type="submit"
                      disabled={updating}
                      className="profile-btn profile-btn-primary"
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setName(user.name);
                        setEmail(user.email);
                      }}
                      className="profile-btn profile-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="profile-quick-stats">
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Member Since</span>
                  <span className="profile-stat-value">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Total Groups</span>
                  <span className="profile-stat-value">{analytics.groupCount}</span>
                </div>
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Total Expenses</span>
                  <span className="profile-stat-value">{analytics.totalExpenses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="profile-analytics">
            {/* Balance Cards */}
            <div className="profile-balance-grid">
              <div className="profile-balance-card green">
                <div className="profile-balance-header">
                  <BanknoteArrowUp className="icon" />
                  <span className="profile-balance-label">You are owed</span>
                </div>
                <p className="profile-balance-amount">₹{analytics.balance?.totalOwed || 0}</p>
              </div>

              <div className="profile-balance-card red">
                <div className="profile-balance-header">
                  <BanknoteArrowDown className="icon" />
                  <span className="profile-balance-label">You owe</span>
                </div>
                <p className="profile-balance-amount">₹{analytics.balance?.totalOwe || 0}</p>
              </div>

              <div className="profile-balance-card blue">
                <div className="profile-balance-header">
                  <HandCoins className="icon" />
                  <span className="profile-balance-label">Total Spent</span>
                </div>
                <p className="profile-balance-amount">₹{analytics.totalSpent || 0}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="profile-analytics-card">
              <h3 className="profile-analytics-title">Spending by Category</h3>
              
              {categoryData.length === 0 ? (
                <p className="profile-analytics-empty">No expense data yet</p>
              ) : (
                <div className="profile-category-list">
                  {categoryData.map(([category, amount]) => {
                    const percentage = (amount / totalCategorySpending) * 100;
                    return (
                      <div key={category}>
                        <div className="profile-category-item-header">
                          <div className="profile-category-name">
                            <div 
                              className="profile-category-dot" 
                              style={{ backgroundColor: categoryColors[category] }}
                            />
                            <span className="profile-category-label">{category}</span>
                          </div>
                          <div className="profile-category-amount-info">
                            <span className="profile-category-amount">₹{amount}</span>
                            <span className="profile-category-percentage">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="profile-category-bar">
                          <div
                            className="profile-category-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: categoryColors[category]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly Spending Trend */}
            <div className="profile-analytics-card">
              <h3 className="profile-analytics-title">Monthly Spending Trend</h3>
              
              {Object.keys(analytics.monthlyTotals || {}).length === 0 ? (
                <p className="profile-analytics-empty">No expense data yet</p>
              ) : (
                <div className="profile-monthly-list">
                  {Object.entries(analytics.monthlyTotals || {})
                    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                    .slice(-6)
                    .map(([month, amount]) => {
                      const maxAmount = Math.max(...Object.values(analytics.monthlyTotals));
                      const percentage = (amount / maxAmount) * 100;
                      
                      return (
                        <div key={month} className="profile-monthly-item">
                          <div className="profile-monthly-label">
                            <Calendar className="icon" />
                            {month}
                          </div>
                          <div className="profile-monthly-bar-container">
                            <div className="profile-monthly-bar">
                              <div
                                className="profile-monthly-bar-fill"
                                style={{ width: `${percentage}%` }}
                              >
                                {percentage > 20 && (
                                  <span className="profile-monthly-amount">₹{amount}</span>
                                )}
                              </div>
                              {percentage <= 20 && (
                                <span className="profile-monthly-amount-outside">₹{amount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;