import React, { useState } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import '../../styles/createGroup.css';

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const removeEmailField = (index) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index, value) => {
    const newEmails = [...memberEmails];
    newEmails[index] = value;
    setMemberEmails(newEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validEmails = memberEmails.filter(email => email.trim() !== '');
      
      await API.post('/groups', {
        name,
        description,
        memberEmails: validEmails
      });

      setName('');
      setDescription('');
      setMemberEmails(['']);
      onSuccess();
      toast.success('Group created successfully!');
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create group';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon-wrapper">
              <Users className="modal-icon" />
            </div>
            <h2 className="modal-title">Create New Group</h2>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="modal-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">{error}</div>
          )}

          <div className="modal-form-content">
            <div className="form-group">
              <label className="form-label">Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Roommates, Trip to Goa, etc."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input form-textarea"
                placeholder="What is this group for?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Add Members (Optional)</label>
              <p className="form-hint">
                You'll be added automatically. Add others by email.
              </p>

              <div className="email-fields-container">
                {memberEmails.map((email, index) => (
                  <div key={index} className="email-field-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="form-input email-input"
                      placeholder="member@example.com"
                    />
                    {memberEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmailField(index)}
                        className="remove-email-btn"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addEmailField}
                className="add-member-btn"
              >
                <Plus className="add-icon" />
                Add another member
              </button>
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
              disabled={loading}
              className="modal-btn modal-btn-submit"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;