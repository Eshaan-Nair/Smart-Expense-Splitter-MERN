import React, { useState, useEffect } from 'react';
import { X, IndianRupee, BanknoteArrowDown } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import '../../styles/createExpense.css';
import '../../styles/createGroup.css';

const CreateExpenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g._id === groupId);
      setSelectedGroup(group);
      
      if (group && splitType === 'custom') {
        const equalAmount = amount ? (parseFloat(amount) / group.members.length).toFixed(2) : '0';
        const splits = group.members.map(member => ({
          userId: member.user._id,
          name: member.user.name,
          amount: equalAmount
        }));
        setCustomSplits(splits);
      }
    }
  }, [groupId, groups, splitType, amount]);

  const fetchGroups = async () => {
    try {
      const response = await API.get('/groups');
      setGroups(response.data.groups);
      if (response.data.groups.length > 0) {
        setGroupId(response.data.groups[0]._id);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    if (type === 'custom' && selectedGroup) {
      const equalAmount = amount ? (parseFloat(amount) / selectedGroup.members.length).toFixed(2) : '0';
      const splits = selectedGroup.members.map(member => ({
        userId: member.user._id,
        name: member.user.name,
        amount: equalAmount
      }));
      setCustomSplits(splits);
    }
  };

  const updateCustomSplit = (userId, value) => {
    setCustomSplits(prevSplits =>
      prevSplits.map(split =>
        split.userId === userId ? { ...split, amount: value } : split
      )
    );
  };

  const validateCustomSplits = () => {
    const totalSplit = customSplits.reduce((sum, split) => sum + parseFloat(split.amount || 0), 0);
    const expenseAmount = parseFloat(amount);
    
    if (Math.abs(totalSplit - expenseAmount) > 0.01) {
      setError(`Split amounts (₹${totalSplit.toFixed(2)}) don't match expense amount (₹${expenseAmount})`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!groupId) {
        setError('Please select a group');
        setLoading(false);
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      let requestBody = {
        title,
        amount: parseFloat(amount),
        category,
        description,
        groupId,
        splitType
      };

      if (splitType === 'custom') {
        if (!validateCustomSplits()) {
          setLoading(false);
          return;
        }
        
        requestBody.splitBetween = customSplits.map(split => ({
          userId: split.userId,
          amount: parseFloat(split.amount)
        }));
      }

      await API.post('/expenses', requestBody);

      setTitle('');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setSplitType('equal');
      setCustomSplits([]);
      
      toast.success('Expense added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create expense';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalCustomSplit = customSplits.reduce((sum, split) => sum + parseFloat(split.amount || 0), 0);
  const splitBalance = amount ? parseFloat(amount) - totalCustomSplit : 0;

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-container">
        <div className="expense-modal-header">
          <div className="expense-modal-header-content">
            <div className="expense-modal-icon-wrapper">
              <BanknoteArrowDown className="expense-modal-icon" />
            </div>
            <h2 className="modal-title">Add Expense</h2>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="modal-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-modal-form">
          {error && (
            <div className="modal-error">{error}</div>
          )}

          <div className="modal-form-content">
            <div className="form-group">
              <label className="form-label">Expense Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Dinner, Groceries, Uber, etc."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <div className="amount-input-wrapper">
                <IndianRupee className="amount-icon" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input amount-input"
                  placeholder="1200"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Group *</label>
              {groups.length === 0 ? (
                <div className="warning-alert">
                  No groups found. Please create a group first.
                </div>
              ) : (
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="form-select"
                  required
                >
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.members.length} members)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Split Type</label>
              <div className="split-type-grid">
                <button
                  type="button"
                  onClick={() => handleSplitTypeChange('equal')}
                  className={`split-type-btn ${splitType === 'equal' ? 'active' : ''}`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => handleSplitTypeChange('custom')}
                  className={`split-type-btn ${splitType === 'custom' ? 'active' : ''}`}
                >
                  Custom Split
                </button>
              </div>
              <p className="form-hint">
                {splitType === 'equal'
                  ? 'Amount will be divided equally among all group members'
                  : 'Specify custom amounts for each member'}
              </p>
            </div>

            {splitType === 'custom' && selectedGroup && (
              <div className="custom-split-container">
                <div className="custom-split-header">
                  <h3 className="custom-split-title">Split Details</h3>
                  <div className="split-balance">
                    <span className="split-balance-label">Balance: </span>
                    <span className={`split-balance-amount ${Math.abs(splitBalance) < 0.01 ? 'balanced' : 'unbalanced'}`}>
                      ₹{splitBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="split-items-list">
                  {customSplits.map((split) => (
                    <div key={split.userId} className="split-item">
                      <div className="split-item-avatar">
                        {split.name[0]}
                      </div>
                      <div className="split-item-info">
                        <p className="split-item-name">{split.name}</p>
                      </div>
                      <div className="split-item-input-wrapper">
                        <span className="split-currency-symbol">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={split.amount}
                          onChange={(e) => updateCustomSplit(split.userId, e.target.value)}
                          className="split-item-input"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="info-alert">
                  <p className="info-alert-text">
                    💡 Make sure the total split equals ₹{amount || '0'}
                  </p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input form-textarea"
                placeholder="Add notes about this expense..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || groups.length === 0}
              className="modal-btn expense-modal-btn-submit"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpenseModal;