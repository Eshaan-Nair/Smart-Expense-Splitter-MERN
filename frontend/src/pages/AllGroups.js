import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import API from '../utils/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import '../styles/allGroups.css';

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await API.get('/groups');
      setGroups(response.data.groups);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading groups..." />;

  return (
    <div className="groups-page-container">
      <Navbar />

      <div className="groups-page-content">
        <div className="groups-page-header">
          <div className="groups-page-header-info">
            <h1>All Groups</h1>
            <p>{groups.length} total groups</p>
          </div>
          <button onClick={() => setShowCreateGroup(true)} className="groups-create-btn">
            <Plus className="icon" />
            New Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="groups-empty-state">
            <Users className="groups-empty-icon" />
            <h3>No groups yet</h3>
            <p>Create your first group to start splitting expenses</p>
            <button onClick={() => setShowCreateGroup(true)} className="groups-empty-btn">
              Create Group
            </button>
          </div>
        ) : (
          <div className="groups-grid-container">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => navigate(`/groups/${group._id}`)}
                className="group-card-item"
              >
                <div className="group-card-header">
                  <div className="group-card-avatar">{group.name[0]}</div>
                  <div className="group-card-info">
                    <h3>{group.name}</h3>
                    <p>{group.members.length} members</p>
                  </div>
                </div>
                <div className="group-card-footer">
                  <span className="group-card-footer-label">Total expenses</span>
                  <span className="group-card-footer-value">₹{group.totalExpenses}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
};

export default AllGroups;