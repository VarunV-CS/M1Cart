import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { updatePassword } from '../../services/auth/api';
import PasswordInput from '../PasswordInput';
import './PasswordUpdateModal.css';

function PasswordUpdateModal({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password validation states
  const [newPasswordValidation, setNewPasswordValidation] = useState({
    isTouched: false,
    isValid: false,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    notSameAsCurrent: true
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isTouched: false,
    isValid: false
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
      setPasswordSuccess('');
      setNewPasswordValidation({
        isTouched: false,
        isValid: false,
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        notSameAsCurrent: true
      });
      setConfirmPasswordValidation({
        isTouched: false,
        isValid: false
      });
    }
  }, [isOpen]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');

    // Real-time password validation for new password
    if (name === 'newPassword') {
      const hasMinLength = value.length >= 6;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const notSameAsCurrent = value !== passwordData.currentPassword;
      const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && notSameAsCurrent;

      setNewPasswordValidation({
        isTouched: value.length > 0,
        isValid: isValid,
        hasMinLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        notSameAsCurrent
      });
    }

    // Real-time confirm password validation
    if (name === 'confirmPassword') {
      setConfirmPasswordValidation({
        isTouched: value.length > 0,
        isValid: value === passwordData.newPassword && value.length > 0
      });
    }

    // Update confirm password validation when new password changes
    if (name === 'newPassword' && confirmPasswordValidation.isTouched) {
      setConfirmPasswordValidation(prev => ({
        ...prev,
        isValid: value === passwordData.confirmPassword && value.length > 0
      }));
    }

    // Re-validate new password when current password changes
    if (name === 'currentPassword' && newPasswordValidation.isTouched) {
      const newPwd = passwordData.newPassword;
      const hasMinLength = newPwd.length >= 6;
      const hasUppercase = /[A-Z]/.test(newPwd);
      const hasLowercase = /[a-z]/.test(newPwd);
      const hasNumber = /\d/.test(newPwd);
      const notSameAsCurrent = newPwd !== value;
      const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && notSameAsCurrent;

      setNewPasswordValidation(prev => ({
        ...prev,
        isValid: isValid,
        notSameAsCurrent
      }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    // Check for uppercase, lowercase, and number
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Reset validation states
        setNewPasswordValidation({
          isTouched: false,
          isValid: false,
          hasMinLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          notSameAsCurrent: true
        });
        setConfirmPasswordValidation({
          isTouched: false,
          isValid: false
        });
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleClose = () => {
    if (!isUpdatingPassword) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`password-update-modal-overlay ${isDark ? 'dark' : ''}`} onClick={handleClose}>
      <div className="password-update-modal" onClick={(e) => e.stopPropagation()}>
        <button className="password-update-modal-close" onClick={handleClose} disabled={isUpdatingPassword}>
          ×
        </button>

        {passwordSuccess ? (
          <div className="password-update-success">
            <div className="success-icon">✓</div>
            <h2>Password Updated!</h2>
            <p>Your password has been successfully changed.</p>
          </div>
        ) : (
          <>
            <div className="password-update-modal-header">
              <h2>Update Password</h2>
              <p>Enter your current password and choose a new one</p>
            </div>

            <form className="password-update-form" onSubmit={handlePasswordUpdate}>
              <div className="password-field">
                <label>Current Password:</label>
                <PasswordInput
                  id="modal-currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </div>
              <div className="password-field">
                <label>New Password:</label>
                <PasswordInput
                  id="modal-newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={newPasswordValidation.isTouched && !newPasswordValidation.isValid ? 'error' : ''}
                />
                {newPasswordValidation.isTouched && (
                  <div className="password-validation-list">
                    <div className={newPasswordValidation.hasMinLength ? 'valid' : 'invalid'}>
                      {newPasswordValidation.hasMinLength ? '✓' : '✗'} At least 6 characters
                    </div>
                    <div className={newPasswordValidation.hasUppercase ? 'valid' : 'invalid'}>
                      {newPasswordValidation.hasUppercase ? '✓' : '✗'} One uppercase letter
                    </div>
                    <div className={newPasswordValidation.hasLowercase ? 'valid' : 'invalid'}>
                      {newPasswordValidation.hasLowercase ? '✓' : '✗'} One lowercase letter
                    </div>
                    <div className={newPasswordValidation.hasNumber ? 'valid' : 'invalid'}>
                      {newPasswordValidation.hasNumber ? '✓' : '✗'} One number
                    </div>
                    <div className={newPasswordValidation.notSameAsCurrent ? 'valid' : 'invalid'}>
                      {newPasswordValidation.notSameAsCurrent ? '✓' : '✗'} Different from current password
                    </div>
                  </div>
                )}
              </div>
              <div className="password-field">
                <label>Confirm New Password:</label>
                <PasswordInput
                  id="modal-confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={confirmPasswordValidation.isTouched && !confirmPasswordValidation.isValid ? 'error' : ''}
                />
                {confirmPasswordValidation.isTouched && !confirmPasswordValidation.isValid && (
                  <span className="validation-indicator invalid">
                    ✗ Passwords do not match
                  </span>
                )}
                {confirmPasswordValidation.isTouched && confirmPasswordValidation.isValid && (
                  <span className="validation-indicator valid">
                    ✓ Passwords match
                  </span>
                )}
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              {passwordSuccess && <div className="password-success">{passwordSuccess}</div>}
              <button
                type="submit"
                className="update-password-btn"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <span className="button-spinner"></span>
                    Updating...
                  </>
                ) : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PasswordUpdateModal;
