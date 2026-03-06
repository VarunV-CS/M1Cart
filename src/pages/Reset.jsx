import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import PasswordInput from '../components/PasswordInput';
import { resetPasswordWithToken } from '../services/auth/api';
import './Reset.css';

function Reset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const resetToken = searchParams.get('token') || '';
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPasswordValidation, setNewPasswordValidation] = useState({
    isTouched: false,
    isValid: false,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isTouched: false,
    isValid: false
  });

  const handleClose = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleEscape]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');

    if (name === 'newPassword') {
      const hasMinLength = value.length >= 6;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

      setNewPasswordValidation({
        isTouched: value.length > 0,
        isValid,
        hasMinLength,
        hasUppercase,
        hasLowercase,
        hasNumber
      });
    }

    if (name === 'confirmPassword') {
      setConfirmPasswordValidation({
        isTouched: value.length > 0,
        isValid: value === passwordData.newPassword && value.length > 0
      });
    }

    if (name === 'newPassword' && confirmPasswordValidation.isTouched) {
      setConfirmPasswordValidation((prev) => ({
        ...prev,
        isValid: value === passwordData.confirmPassword && value.length > 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!resetToken) {
        throw new Error('This reset link is invalid or missing its token.');
      }

      await resetPasswordWithToken(resetToken, passwordData.newPassword);

      setPasswordSuccess('Password has been reset successfully!');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setNewPasswordValidation({
        isTouched: false,
        isValid: false,
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false
      });
      setConfirmPasswordValidation({
        isTouched: false,
        isValid: false
      });

      window.setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setPasswordError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`reset-page ${isDark ? 'dark' : ''}`}>
      <div className="reset-page-shell">
        <div className="resetp-modal-content reset-page-card">
          <div className="resetp-modal-body">
            <div className="resetp-modal-header">
              <div className="resetp-modal-icon">
                🔑
              </div>
              <h2 className="resetp-modal-title">Reset Password</h2>
              <p className="resetp-modal-subtitle">
                {resetToken
                  ? 'Enter your new password below. Make sure it meets the requirements.'
                  : 'This page needs a valid reset link from your email.'}
              </p>
            </div>

            {passwordSuccess && (
              <div className="resetp-modal-success">
                <span className="resetp-success-icon">✓</span>
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="resetp-modal-error">
                <span className="resetp-error-icon">✗</span>
                <span>{passwordError}</span>
              </div>
            )}
            {!resetToken && !passwordError && (
              <div className="resetp-modal-error">
                <span className="resetp-error-icon">✗</span>
                <span>Missing reset token. Open the link sent to your email and try again.</span>
              </div>
            )}

            <form className="resetp-modal-form" onSubmit={handleSubmit}>
              <div className="resetp-form-group">
                <label htmlFor="newPassword">New Password</label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  disabled={isSubmitting || !resetToken}
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
                  </div>
                )}
              </div>

              <div className="resetp-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  disabled={isSubmitting || !resetToken}
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

              <button
                type="submit"
                className="resetp-submit-btn"
                disabled={isSubmitting || !resetToken}
              >
                {isSubmitting ? (
                  <>
                    <span className="resetp-button-spinner"></span>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                className="resetp-cancel-btn"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reset;
