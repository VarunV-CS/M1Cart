import { useEffect, useCallback, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { updateUser, changeUserPassword, deactivateUser } from '../services/api';
import './UserModal.css';

const UserModal = ({ user, onClose, onUserUpdated, isAdminView = true }) => {
  const { isDark } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    businessName: '',
    role: 'buyer'
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    adminPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside the modal content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('user-modal-overlay')) {
      onClose();
    }
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        businessName: user.businessName || '',
        role: user.role || 'buyer'
      });
    }
  }, [user]);

  // Add event listeners for escape key and body scroll lock
  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [handleEscape]);

  if (!user) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'seller':
        return 'role-seller';
      case 'buyer':
      default:
        return 'role-buyer';
    }
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate
      if (!editForm.name || editForm.name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        setIsSubmitting(false);
        return;
      }
      
      if (editForm.role === 'seller' && !editForm.businessName && !user.businessName) {
        setError('Business name is required for sellers');
        setIsSubmitting(false);
        return;
      }

      const response = await updateUser(user._id, {
        name: editForm.name.trim(),
        businessName: editForm.businessName?.trim(),
        role: editForm.role
      });
      
      if (response.success) {
        setSuccessMessage('User updated successfully!');
        setIsEditMode(false);
        if (onUserUpdated) {
          onUserUpdated(response.user);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditForm({
      name: user.name || '',
      businessName: user.businessName || '',
      role: user.role || 'buyer'
    });
    setError('');
    setIsEditMode(false);
  };

  // Handle password form change
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError('');
    setIsSubmitting(true);
    
    try {
      if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
      
      if (!passwordForm.adminPassword) {
        setPasswordError('Admin password is required for verification');
        setIsSubmitting(false);
        return;
      }

      const response = await changeUserPassword(
        user._id,
        passwordForm.newPassword,
        passwordForm.adminPassword
      );
      
      if (response.success) {
        setSuccessMessage('Password changed successfully!');
        setIsPasswordModalOpen(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: '',
          adminPassword: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deactivate (UI only for now - as per task)
  const handleDeactivate = () => {
    // Show confirmation
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name}'s account? This action cannot be undone.`
    );
    
    if (confirmed) {
      // For now, just show a message as per task requirements
      alert('Account deactivate functionality will be implemented. This is just a placeholder.');
    }
  };

  return (
    <div 
      className={`user-modal-overlay ${isDark ? 'dark' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="user-modal-content">
        <button 
          className="user-modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="user-modal-body">
          {/* Action Buttons Header */}
          <div className="user-modal-actions">
            <button 
              className="user-action-btn edit-btn"
              onClick={() => setIsEditMode(true)}
              title="Edit User"
            >
              ✎
            </button>
            <button 
              className="user-action-btn password-btn"
              onClick={() => setIsPasswordModalOpen(true)}
              title="Change Password"
            >
              ꄗ
            </button>
            <button 
              className="user-action-btn deactivate-btn"
              onClick={handleDeactivate}
              title="Deactivate Account"
            >
              ✗
            </button>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="user-modal-success">{successMessage}</div>
          )}
          {error && (
            <div className="user-modal-error">{error}</div>
          )}

          <div className="user-modal-header">
            <div className="user-modal-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="user-modal-header-info">
              {isEditMode ? (
                <div className="edit-form-group">
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    placeholder="Username"
                    className="edit-input"
                  />
                </div>
              ) : (
                <h2 className="user-modal-name">{user.name}</h2>
              )}
              {isEditMode ? (
                (editForm.role === 'seller' || editForm.businessName) && (
                  <div className="edit-form-group">
                    <input
                      type="text"
                      name="businessName"
                      value={editForm.businessName}
                      onChange={handleEditFormChange}
                      placeholder="Business Name"
                      className="edit-input"
                    />
                  </div>
                )
              ) : (
                user.businessName && (
                  <p className="user-modal-business">{user.businessName}</p>
                )
              )}
            </div>
          </div>

          <div className="user-modal-details">
            <div className="user-detail-row">
              <span className="user-detail-label">Email</span>
              <span className="user-detail-value">{user.email}</span>
            </div>
            
            <div className="user-detail-row">
              <span className="user-detail-label">Role</span>
              {isEditMode ? (
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditFormChange}
                  className="edit-select"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span className={`user-detail-value role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              )}
            </div>

            {user.businessName && !isEditMode && (
              <div className="user-detail-row">
                <span className="user-detail-label">Business Name</span>
                <span className="user-detail-value">{user.businessName}</span>
              </div>
            )}

            <div className="user-detail-row">
              <span className="user-detail-label">Products Submitted</span>
              <span className="user-detail-value">
                {user.productCount !== undefined ? user.productCount : 0}
              </span>
            </div>

            <div className="user-detail-row">
              <span className="user-detail-label">Member Since</span>
              <span className="user-detail-value">{formatDate(user.createdAt)}</span>
            </div>

            {user.lastLogin && (
              <div className="user-detail-row">
                <span className="user-detail-label">Last Login</span>
                <span className="user-detail-value">{formatDate(user.lastLogin)}</span>
              </div>
            )}

            <div className="user-detail-row">
              <span className="user-detail-label">Verified</span>
              <span className={`user-verified-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                <span className="verified-checkbox">
                  {user.isVerified ? '✓' : ''}
                </span>
                {user.isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            <div className="user-detail-row">
              <span className="user-detail-label">User ID</span>
              <span className="user-detail-value user-id">{user._id}</span>
            </div>
          </div>

          {/* Edit Mode Buttons */}
          {isEditMode && (
            <div className="edit-mode-buttons">
              <button 
                className="save-btn"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div 
          className={`password-modal-overlay ${isDark ? 'dark' : ''}`}
          onClick={(e) => e.target === e.currentTarget && !isSubmitting && setIsPasswordModalOpen(false)}
        >
          <div className="password-modal-content">
            <button 
              className="password-modal-close" 
              onClick={() => !isSubmitting && setIsPasswordModalOpen(false)}
              disabled={isSubmitting}
            >
              ×
            </button>
            
            <h3>Change Password</h3>
            <p className="password-modal-subtitle">
              Change password for: <strong>{user.name}</strong>
            </p>

            {passwordError && (
              <div className="password-modal-error">{passwordError}</div>
            )}

            <div className="password-form">
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group admin-password-group">
                <label>Your Admin Password * (for verification)</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={passwordForm.adminPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Enter your admin password"
                  disabled={isSubmitting}
                />
              </div>

              <div className="password-modal-buttons">
                <button 
                  className="change-password-btn"
                  onClick={handlePasswordChange}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
                <button 
                  className="cancel-password-btn"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordForm({
                      newPassword: '',
                      confirmPassword: '',
                      adminPassword: ''
                    });
                    setPasswordError('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModal;

