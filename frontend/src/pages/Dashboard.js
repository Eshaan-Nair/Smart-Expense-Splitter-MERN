import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { HandCoins, Users, Plus, BanknoteArrowDown, BanknoteArrowUp } from 'lucide-react';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import CreateExpenseModal from '../components/expenses/CreateExpenseModal';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(null);
  const [groups, setGroups] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [balanceRes, groupsRes] = await Promise.all([
        API.get('/settlements/user'),
        API.get('/groups'),
      ]);

      setBalance(balanceRes.data.summary);
      setGroups(groupsRes.data.groups);

      if (groupsRes.data.groups.length > 0) {
        const expensePromises = groupsRes.data.groups.map(group =>
          API.get(`/expenses/group/${group._id}`)
        );
        const expenseResponses = await Promise.all(expensePromises);
        
        const combinedExpenses = expenseResponses
          .flatMap(res => res.data.expenses)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAllExpenses(combinedExpenses);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const recentGroups = groups.slice(0, 2);
  const recentExpenses = allExpenses.slice(0, 5);

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome, {user.name.split(' ')[0]}! 👋</h2>
          <p>Here's your expense overview</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>You are owed</p>
                <p>₹{balance?.totalOwed || 0}</p>
              </div>
              <BanknoteArrowUp className="stat-card-icon" />
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>You owe</p>
                <p>₹{balance?.totalOwe || 0}</p>
              </div>
              <BanknoteArrowDown className="stat-card-icon" />
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Total Groups</p>
                <p>{groups.length}</p>
              </div>
              <Users className="stat-card-icon" />
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3 className="section-header">Quick Actions</h3>
          <div className="quick-actions-grid">
            <button onClick={() => setShowCreateExpense(true)} className="quick-action-btn">
              <Plus className="icon green" />
              <span>Add Expense</span>
            </button>
            <button onClick={() => setShowCreateGroup(true)} className="quick-action-btn">
              <Users className="icon purple" />
              <span>New Group</span>
            </button>
            <button onClick={() => navigate('/groups')} className="quick-action-btn">
              <Users className="icon blue" />
              <span>View Groups</span>
            </button>
            <button onClick={() => navigate('/settlements')} className="quick-action-btn">
              <HandCoins className="icon orange" />
              <span>Settlements</span>
            </button>
          </div>
        </div>

        <div className="groups-section">
          <h3 className="section-header">My Groups</h3>

          {groups.length === 0 ? (
            <div className="empty-state">
              <Users className="icon" />
              <p>No groups yet</p>
              <p>Create your first group to start splitting expenses</p>
            </div>
          ) : (
            <div className="groups-grid">
              {recentGroups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="group-card"
                >
                  <div className="group-card-header">
                    <div className="group-avatar">{group.name[0]}</div>
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p>{group.members.length} members</p>
                    </div>
                  </div>
                  <div className="group-card-footer">
                    <span>Total expenses</span>
                    <span>₹{group.totalExpenses}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {allExpenses.length > 0 && (
          <div className="expenses-section">
            <div className="expenses-header">
              <h3 className="section-header">Recent Expenses</h3>
              <button onClick={() => navigate('/expenses')}>View All</button>
            </div>

            <div className="expenses-list">
              {recentExpenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-item-content">
                    <div className="expense-item-left">
                      <div className="expense-icon">
                        <BanknoteArrowDown className="icon" />
                      </div>
                      <div className="expense-details">
                        <p>{expense.title}</p>
                        <p>
                          {expense.paidBy.name} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="expense-item-right">
                      <p>₹{expense.amount}</p>
                      <p>{expense.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={fetchDashboardData}
      />
      <CreateExpenseModal
        isOpen={showCreateExpense}
        onClose={() => setShowCreateExpense(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;