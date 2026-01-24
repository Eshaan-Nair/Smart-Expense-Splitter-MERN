import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BadgeIndianRupee, TrendingUp, UserPlus, X, IndianRupee, Trash2 } from 'lucide-react';
import API from '../utils/api';
import CreateExpenseModal from '../components/expenses/CreateExpenseModal';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import '../styles/groupDetails.css';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const fetchGroupData = useCallback(async () => {
    try {
      const [groupRes, expensesRes, settlementsRes] = await Promise.all([
        API.get(`/groups/${id}`),
        API.get(`/expenses/group/${id}`),
        API.get(`/settlements/group/${id}`),
      ]);

      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setSettlements(settlementsRes.data.optimizedSettlements);
      setBalances(settlementsRes.data.allBalances);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group data:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleMarkPaid = async (settlement) => {
    try {
      const expensesToSettle = expenses.filter((expense) =>
        expense.splitBetween.some(
          (split) =>
            split.user._id === settlement.from.id &&
            !split.isPaid &&
            expense.paidBy._id === settlement.to.id
        )
      );

      if (expensesToSettle.length === 0) {
        toast.error('No expenses to settle');
        return;
      }

      for (const expense of expensesToSettle) {
        await API.post('/expenses/settle', {
          expenseId: expense._id,
          userId: settlement.from.id,
        });
      }

      toast.success(`Payment of ₹${settlement.amount} marked as paid!`);
      fetchGroupData();
    } catch (error) {
      console.error('Error settling payment:', error);
      toast.error('Failed to mark as paid');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"? This will delete all expenses in this group. This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/groups/${id}`);
      toast.success('Group deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);

    try {
      await API.post(`/groups/${id}/members`, { email: memberEmail });
      toast.success('Member added successfully');
      setMemberEmail('');
      setShowAddMember(false);
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading group..." />;

  if (!group) {
    return (
      <div className="group-not-found">
        <Navbar />
        <div className="not-found-content">
          <p>Group not found</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : null;

  return (
    <div className="group-details-container">
      <Navbar />

      <div className="breadcrumb">
        <div className="breadcrumb-content">
          <button onClick={() => navigate('/dashboard')} className="breadcrumb-link">
            Dashboard
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{group.name}</span>
        </div>
      </div>

      <div className="group-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Total Expenses</p>
                <p>₹{group.totalExpenses}</p>
              </div>
              <BadgeIndianRupee className="stat-card-icon" />
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Number of Expenses</p>
                <p>{expenses.length}</p>
              </div>
              <BadgeIndianRupee className="stat-card-icon" />
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Members</p>
                <p>{group.members.length}</p>
              </div>
              <Users className="stat-card-icon" />
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Expenses Section */}
            <div className="section">
              <div className="section-header">
                <h2>All Expenses</h2>
                <button onClick={() => setShowAddMember(true)} className="add-member-btn">
                  <UserPlus className="icon" />
                  Add Member
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="empty-state">
                  <BadgeIndianRupee className="icon" />
                  <p>No expenses yet</p>
                  <p>Add your first expense to get started</p>
                </div>
              ) : (
                <div className="expenses-list">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="expense-card">
                      <div className="expense-content">
                        <div className="expense-left">
                          <div className="expense-icon-wrapper">
                            <BadgeIndianRupee className="icon" />
                          </div>
                          <div className="expense-details">
                            <p className="expense-title">{expense.title}</p>
                            <p className="expense-payer">Paid by {expense.paidBy.name}</p>
                            <p className="expense-meta">
                              {new Date(expense.date).toLocaleDateString()} • {expense.category}
                            </p>
                            <div className="split-tags">
                              {expense.splitBetween.map((split, idx) => (
                                <span key={idx} className={`split-tag ${split.isPaid ? 'paid' : 'unpaid'}`}>
                                  {split.user.name}: ₹{split.amount} {split.isPaid ? '✓' : '✗'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="expense-amount">
                          <p>₹{expense.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Members Section */}
            <div className="section">
              <h2 className="section-title">Group Members</h2>
              <div className="members-list">
                {group.members.map((member) => {
                  const balance = balances[member.user._id] || 0;
                  return (
                    <div key={member.user._id} className="member-card">
                      <div className="member-left">
                        <div className="member-avatar">
                          {member.user.name[0]}
                        </div>
                        <div className="member-info">
                          <p className="member-name">{member.user.name}</p>
                          <p className="member-email">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="member-balance">
                        <p className={`balance-amount ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'}`}>
                          {balance > 0 ? '+' : ''}₹{balance}
                        </p>
                        <p className="balance-label">
                          {balance > 0 ? 'is owed' : balance < 0 ? 'owes' : 'settled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Settlements */}
          <div className="right-column">
            <div className="sticky-content">
              <h2 className="section-title">Settlement Plan</h2>

              {settlements.length === 0 ? (
                <div className="empty-state">
                  <TrendingUp className="icon" />
                  <p>All settled up!</p>
                  <p>No pending settlements</p>
                </div>
              ) : (
                <div className="settlements-section">
                  <div className="settlements-list">
                    {settlements.map((settlement, idx) => {
                      const isFromCurrentUser = settlement.from.id === currentUserId;
                      return (
                        <div key={idx} className="settlement-card">
                          <div className="settlement-header">
                            <div className="settlement-icon-wrapper">
                              <IndianRupee className="icon" />
                            </div>
                            <div className="settlement-info">
                              <p className="settlement-text">
                                <span className="name">{settlement.from.name}</span>
                                <span className="action"> pays </span>
                                <span className="name">{settlement.to.name}</span>
                              </p>
                              <p className="settlement-amount">₹{settlement.amount}</p>
                            </div>
                          </div>
                          {isFromCurrentUser && (
                            <button
                              onClick={() => handleMarkPaid(settlement)}
                              className="mark-paid-btn"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="optimization-tip">
                    <p className="tip-title">💡 Optimized Settlements</p>
                    <p className="tip-text">
                      Only {settlements.length} transaction{settlements.length !== 1 ? 's' : ''} needed to settle everything!
                    </p>
                  </div>
                </div>
              )}

              {/* Delete Group */}
              <div className="delete-section">
                <button onClick={handleDeleteGroup} className="delete-btn">
                  <Trash2 className="icon" />
                  Delete Group
                </button>
                <p className="delete-warning">This will delete all expenses in this group</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Member</h3>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setMemberEmail('');
                }}
                className="modal-close"
              >
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Member Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
                <p className="input-hint">The user must be registered on SplitSmart</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setMemberEmail('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={addingMember} className="submit-btn">
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateExpenseModal
        isOpen={showCreateExpense}
        onClose={() => setShowCreateExpense(false)}
        onSuccess={fetchGroupData}
      />
    </div>
  );
};

export default GroupDetails;