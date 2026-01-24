import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, HandCoins } from 'lucide-react';
import API from '../utils/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import '../styles/allSettlements.css';

const AllSettlements = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const groupsRes = await API.get('/groups');
      
      const groupsWithSettlements = await Promise.all(
        groupsRes.data.groups.map(async (group) => {
          try {
            const settlementsRes = await API.get(`/settlements/group/${group._id}`);
            return {
              ...group,
              settlements: settlementsRes.data.optimizedSettlements
            };
          } catch (error) {
            return { ...group, settlements: [] };
          }
        })
      );

      setGroups(groupsWithSettlements);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settlements..." />;

  const totalSettlements = groups.reduce((sum, group) => sum + group.settlements.length, 0);
  const currentUserId = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : null;

  return (
    <div className="settlements-page-container">
      <Navbar />

      <div className="settlements-page-content">
        <div className="settlements-page-header">
          <h1>All Settlements</h1>
          <p>
            {totalSettlements} pending settlement{totalSettlements !== 1 ? 's' : ''} across {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>

        {totalSettlements === 0 ? (
          <div className="settlements-empty-state">
            <HandCoins className="settlements-empty-icon" />
            <h3>All settled up!</h3>
            <p>No pending settlements across all your groups</p>
          </div>
        ) : (
          <div className="settlements-list-container">
            {groups.filter(group => group.settlements.length > 0).map((group) => (
              <div key={group._id} className="settlement-group-card">
                <div 
                  className="settlement-group-header"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <div className="settlement-group-avatar">{group.name[0]}</div>
                  <div className="settlement-group-info">
                    <h3>{group.name}</h3>
                    <p>
                      {group.settlements.length} settlement{group.settlements.length !== 1 ? 's' : ''} needed
                    </p>
                  </div>
                </div>

                <div className="settlements-grid">
                  {group.settlements.map((settlement, idx) => {
                    const isFromCurrentUser = settlement.from.id === currentUserId;

                    return (
                      <div
                        key={idx}
                        className={`settlement-card ${isFromCurrentUser ? 'user-owes' : ''}`}
                      >
                        <div className="settlement-card-content">
                          <div className="settlement-card-icon">
                            <IndianRupee className="icon" />
                          </div>
                          <div className="settlement-card-details">
                            <p className="settlement-card-text">
                              <span className="name">{settlement.from.name}</span>
                              <span className="label"> pays </span>
                              <span className="name">{settlement.to.name}</span>
                            </p>
                            <p className="settlement-card-amount">₹{settlement.amount}</p>
                            {isFromCurrentUser && (
                              <span className="settlement-card-badge">You need to pay this</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSettlements;