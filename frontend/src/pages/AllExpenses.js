import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, BanknoteArrowDown } from 'lucide-react';
import API from '../utils/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import '../styles/allExpenses.css';

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchTerm, selectedCategory, dateRange]);

  const fetchExpenses = async () => {
    try {
      const groupsRes = await API.get('/groups');
      
      if (groupsRes.data.groups.length > 0) {
        const expensePromises = groupsRes.data.groups.map(group =>
          API.get(`/expenses/group/${group._id}`)
        );
        const expenseResponses = await Promise.all(expensePromises);
        
        const allExpenses = expenseResponses
          .flatMap(res => res.data.expenses)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setExpenses(allExpenses);
        setFilteredExpenses(allExpenses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.paidBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    if (dateRange.start) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) <= new Date(dateRange.end)
      );
    }

    setFilteredExpenses(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || dateRange.start || dateRange.end;

  if (loading) return <LoadingSpinner message="Loading expenses..." />;

  return (
    <div className="expenses-page-container">
      <Navbar />

      <div className="expenses-page-content">
        <div className="expenses-page-header">
          <h1>All Expenses</h1>
          <p>
            {filteredExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="expenses-filter-container">
          <div className="expenses-filter-row">
            <div className="expenses-search-wrapper">
              <Search className="expenses-search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or person..."
                className="expenses-search-input"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`expenses-filter-btn ${showFilters || hasActiveFilters ? 'active' : ''}`}
            >
              <Filter className="icon" />
              Filters
              {hasActiveFilters && !showFilters && (
                <span className="expenses-filter-indicator" />
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="expenses-clear-btn">
                <X className="icon" />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="expenses-advanced-filters">
              <div className="expenses-filter-group">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="expenses-filter-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="expenses-filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="expenses-filter-date"
                />
              </div>

              <div className="expenses-filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="expenses-filter-date"
                />
              </div>
            </div>
          )}
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="expenses-empty-state">
            <BanknoteArrowDown className="expenses-empty-icon" />
            <h3>
              {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}
            </h3>
            <p>
              {expenses.length === 0 
                ? 'Add your first expense to start tracking'
                : 'Try adjusting your search or filters'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="expenses-empty-btn">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="expenses-list-container">
            {filteredExpenses.map((expense) => (
              <div 
                key={expense._id} 
                className="expense-list-item"
                onClick={() => navigate(`/groups/${expense.group}`)}
              >
                <div className="expense-list-item-content">
                  <div className="expense-list-item-left">
                    <div className="expense-list-icon-wrapper">
                      <BanknoteArrowDown className="icon" />
                    </div>
                    <div className="expense-list-details">
                      <p className="expense-list-title">{expense.title}</p>
                      <p className="expense-list-paidby">Paid by {expense.paidBy.name}</p>
                      <p className="expense-list-meta">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} • {expense.category}
                      </p>
                      <div className="expense-list-splits">
                        {expense.splitBetween.slice(0, 3).map((split, idx) => (
                          <span
                            key={idx}
                            className={`expense-split-badge ${split.isPaid ? 'paid' : 'unpaid'}`}
                          >
                            {split.user.name}: ₹{split.amount}
                          </span>
                        ))}
                        {expense.splitBetween.length > 3 && (
                          <span className="expense-split-badge more">
                            +{expense.splitBetween.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="expense-list-item-right">
                    <p className="expense-list-amount">₹{expense.amount}</p>
                    <span className="expense-list-category">{expense.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllExpenses;