import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, getProfile, setUser as setStoredUser, sendVerificationOTP, updatePassword } from '../services/api';
import VerificationModal from '../components/VerificationModal';
import PasswordInput from '../components/PasswordInput';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // Password update state
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

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      // Check authentication
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Get user data
      const userData = getUser();
      
      // Check if user is a seller - redirect to seller dashboard
      if (userData?.role === 'seller') {
        navigate('/seller-dashboard');
        return;
      }
      
      // Check if user is an admin - redirect to admin dashboard
      if (userData?.role === 'admin') {
        navigate('/admin-dashboard');
        return;
      }

      setUser(userData);

      try {
        const profileResponse = await getProfile();
        const profileUser = profileResponse?.user;

        if (isMounted && profileUser) {
          const mergedUser = { ...userData, ...profileUser };
          setUser(mergedUser);
          setStoredUser(mergedUser);
        }
      } catch (error) {
        console.error('Error loading latest profile:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // If just logged in, sync cart from backend
      if (location.state?.justLoggedIn && cartItems.length === 0) {
        // The cart context will handle loading cart from backend
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.state, cartItems.length]);

  if (isLoading) {
    return (
      <div className={`dashboard-container ${isDark ? 'dark' : ''}`}>
        <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
      </div>
    );
  }

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Round to 2 decimal places to avoid floating-point precision issues
    return Math.round(total * 100) / 100;
  };

  const handleVerifyClick = async () => {
    try {
      await sendVerificationOTP();
      setShowVerificationModal(true);
    } catch (error) {
      console.error('Error sending verification OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerificationComplete = () => {
    // Update local user state to reflect verification status
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, isVerified: true };
      setStoredUser(updatedUser);
      return updatedUser;
    });
  };

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
      }
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className={`dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Welcome, {user?.name || user?.email || 'User'}!</h1>
          <p className="dashboard-email">{user?.email}</p>
        </div>
        <div className="account-actions">
          <button 
            className="orders-btn"
            onClick={() => navigate('/orders')}
          >
            Your Orders
          </button>
          {user?.isVerified === false && (
            <button 
              className="verify-account-btn"
              onClick={handleVerifyClick}
            >
              Verify Account
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {/* User Info Section */}
        <div className="user-info-section">
          <h2>Account Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name || 'Not set'}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className="role-badge">{user?.role || 'buyer'}</span>
            </div>
          </div>
        </div>

        {/* Password Update Section */}
        <div className="password-section">
          <h2>Update Password</h2>
          <form className="password-form" onSubmit={handlePasswordUpdate}>
            <div className="password-field">
              <label>Current Password:</label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="password-field">
              <label>New Password:</label>
              <PasswordInput
                id="newPassword"
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
                id="confirmPassword"
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
        </div>
      </div>

      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

export default Dashboard;
