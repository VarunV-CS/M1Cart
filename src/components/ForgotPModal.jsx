import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { checkEmailExists } from '../services/api';
import './ForgotPModal.css';

const ForgotPModal = ({ isOpen, onClose, onShowResetPassword }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailValidation, setEmailValidation] = useState({
    isTouched: false,
    isValid: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailFound, setEmailFound] = useState(false);

  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside the modal content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('forgotp-modal-overlay')) {
      onClose();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setEmailError('');
      setEmailValidation({ isTouched: false, isValid: false });
      setMessage('');
      setEmailChecked(false);
      setEmailFound(false);
    }
  }, [isOpen]);

  // Add event listeners for escape key and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  // Validate email format
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error and email check status when user starts typing
    if (emailError) {
      setEmailError('');
    }
    if (emailChecked) {
      setEmailChecked(false);
      setEmailFound(false);
      setMessage('');
    }
    
    // Real-time validation
    if (value.length > 0) {
      const isValid = validateEmail(value);
      setEmailValidation({
        isTouched: true,
        isValid: isValid
      });
    } else {
      setEmailValidation({
        isTouched: false,
        isValid: false
      });
    }
  };

  // Handle email input blur
  const handleEmailBlur = () => {
    setEmailValidation(prev => ({ ...prev, isTouched: true }));
    if (email.length > 0 && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };

  // Handle send button click
  const handleSend = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      setEmailValidation({ isTouched: true, isValid: false });
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setEmailValidation({ isTouched: true, isValid: false });
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setMessage('');

    try {      
      // Check if email exists in the database
      const response = await checkEmailExists(email);
      
      if (response.success) {
        if (response.exists) {
          // Email found - proceed with password reset flow
          setEmailFound(true);
          setEmailChecked(true);
          
          // Close ForgotPModal and show ResetPasswordModal
          onClose();
          if (onShowResetPassword) {
            onShowResetPassword();
          }

          // Clear email after successful submission
          setEmail('');
          setEmailValidation({ isTouched: false, isValid: false });
        } else {
          // Email not found - show error in VerificationModal style
          setEmailError('No account found with this email address');
          setEmailValidation({ isTouched: true, isValid: false });
          setEmailChecked(false);
          setEmailFound(false);
        }
      }
    } catch (error) {
      setEmailError(error.message || 'Failed to check email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`forgotp-modal-overlay ${isDark ? 'dark' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="forgotp-modal-content">
        <button 
          className="forgotp-modal-close" 
          onClick={onClose}
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          ×
        </button>
        
        <div className="forgotp-modal-body">
          {/* Header */}
          <div className="forgotp-modal-header">
            <div className="forgotp-modal-icon">
              🔐
            </div>
            <h2 className="forgotp-modal-title">Forgot Password?</h2>
            <p className="forgotp-modal-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success/Error Messages - VerificationModal Style */}
          {message && (
            <div className="forgotp-modal-success">
              <span className="forgotp-success-icon">✓</span>
              <span>{message}</span>
            </div>
          )}
          {emailError && (
            <div className="forgotp-modal-error">
              <span className="forgotp-error-icon">✗</span>
              <span>{emailError}</span>
            </div>
          )}

          {/* Email Input Form */}
          <div className="forgotp-modal-form">
            <div className="forgotp-form-group">
              <label htmlFor="forgotp-email">Email Address</label>
              <input
                type="email"
                id="forgotp-email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="Enter your registered email"
                className={`${emailError ? 'error' : ''} ${emailValidation.isTouched && !emailError ? (emailValidation.isValid ? 'valid' : 'invalid') : ''}`}
                disabled={isSubmitting}
                autoComplete="email"
              />
              {emailValidation.isTouched && !emailError && (
                <span className={`forgotp-validation-indicator ${emailValidation.isValid ? 'valid' : 'invalid'}`}>
                  {emailValidation.isValid ? '✓ Valid email format' : '✗ Invalid email format'}
                </span>
              )}
            </div>

            {/* Send Button */}
            <button 
              className="forgotp-send-btn"
              onClick={handleSend}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="forgotp-button-spinner"></span>
                  Checking...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Cancel Button */}
            <button 
              className="forgotp-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

          {/* Back to Login */}
          <div className="forgotp-modal-footer">
            <p>
              Remember your password?{' '}
              <button 
                className="forgotp-back-btn" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPModal;

