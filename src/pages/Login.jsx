import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, setToken, setUser } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [errors, setErrors] = useState({});
  const [emailValidation, setEmailValidation] = useState({
    isTouched: false,
    isValid: false
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isTouched: false,
    isValid: false
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time email/username validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = value.includes('@');
      // Allow both email format and plain name (name must be at least 3 chars)
      const isValid = isEmail ? emailRegex.test(value) : value.trim().length >= 3;
      setEmailValidation(prev => ({
        ...prev,
        isValid: isValid,
        isTouched: value.length > 0
      }));
    }
    
    // Real-time confirm password validation
    if (name === 'confirmPassword') {
      setConfirmPasswordValidation(prev => ({
        ...prev,
        isTouched: value.length > 0,
        isValid: value === formData.password && value.length > 0
      }));
    }
    
    // Update confirm password validation when password changes
    if (name === 'password' && confirmPasswordValidation.isTouched) {
      setConfirmPasswordValidation(prev => ({
        ...prev,
        isValid: value === formData.confirmPassword && value.length > 0
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isLogin && formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    // Email or Username validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required';
    } else {
      const isEmail = formData.email.includes('@');
      if (isEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      } else {
        if (formData.email.trim().length < 3) {
          newErrors.email = 'Username must be at least 3 characters';
        }
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }
    
    // Confirm password validation
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      try {
        let response;
        
        if (isLogin) {
          // Login logic - call the login API
          response = await login(formData.email.trim().toLowerCase(), formData.password);
          
          // Check if login was successful
          if (response.success || response.token) {
            const userData = response.user || {
              email: formData.email,
              name: formData.email.split('@')[0]
            };
            // Ensure user data has the correct structure
            const userToStore = {
              id: userData.id || response.user?._id,
              name: userData.username || userData.name || formData.email.split('@')[0],
              email: userData.email || formData.email,
              role: userData.role || 'buyer'
            };
            
            // Store token and user data using api service
            if (response.token) {
              setToken(response.token);
            }
            setUser(userToStore);
            
            // Set isAuthenticated flag for backward compatibility
            localStorage.setItem('isAuthenticated', 'true');
            
            // Dispatch custom event to notify other components of login
            window.dispatchEvent(new CustomEvent('m1cart-auth-change', { 
              detail: { type: 'login', user: userToStore } 
            }));
            
            console.log('Login successful:', userToStore);
            
            // Navigate based on user role
            // setTimeout(() => {
              if (userToStore.role === 'admin') {
                navigate('/admin-dashboard', { state: { justLoggedIn: true } });
              } else if (userToStore.role === 'seller') {
                navigate('/seller-dashboard', { state: { justLoggedIn: true } });
              } else {
                navigate('/dashboard', { state: { justLoggedIn: true } });
              }
            // }, 100);
            // } else {
            //   throw new Error(response.message || 'Login failed');
            // }
          }
        } else {
          // Registration logic - call the register API
          response = await register({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: formData.role
          });
          
          // Check if registration was successful
          if (response.success || response.token) {
            const userData = response.user || {
              name: formData.name,
              email: formData.email
            };
            
            // Ensure user data has the correct structure
            const userToStore = {
              id: userData.id || response.user?._id,
              name: userData.Username || userData.name || formData.name,
              email: userData.Email || userData.email || formData.email,
              role: userData.role || formData.role
            };
            
            // Store token and user data using api service
            if (response.token) {
              setToken(response.token);
            }
            setUser(userToStore);
            
            // Set isAuthenticated flag for backward compatibility
            localStorage.setItem('isAuthenticated', 'true');
            
            // Dispatch custom event to notify other components of registration
            window.dispatchEvent(new CustomEvent('m1cart-auth-change', { 
              detail: { type: 'register', user: userToStore } 
            }));
            
            console.log('Registration successful:', userToStore);
            
            // Navigate to dashboard
            navigate('/dashboard');
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setErrors({
          form: error.message || 'Authentication failed. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'buyer'
    });
    setEmailValidation({ isTouched: false, isValid: false });
    setConfirmPasswordValidation({ isTouched: false, isValid: false });
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="app-title">M1Cart</h1>
          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue' : 'Join us and get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={errors.name ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address or Username</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => {
                setEmailValidation(prev => ({ ...prev, isTouched: true }));
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isEmail = formData.email.includes('@');
                // Allow both email format and plain name (name must be at least 3 chars)
                const isValid = isEmail ? emailRegex.test(formData.email) : formData.email.trim().length >= 3;
                if (!isValid && formData.email.length > 0) {
                  setErrors(prev => ({
                    ...prev,
                    email: isEmail ? 'Please enter a valid email address' : 'Username must be at least 3 characters'
                  }));
                }
              }}
              placeholder="Enter your email or username"
              className={`${errors.email ? 'error' : ''} ${emailValidation.isTouched && !errors.email ? (emailValidation.isValid ? 'valid' : '') : ''}`}
              disabled={isLoading}
            />
            {emailValidation.isTouched && !errors.email && (
              <span className={`validation-indicator ${emailValidation.isValid ? 'valid' : 'invalid'}`}>
                {emailValidation.isValid ? '✓' : (formData.email.includes('@') ? '✗ Invalid email format' : '✗ Username must be at least 3 characters')}
              </span>
            )}
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
              error={!!errors.password}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => {
                  setConfirmPasswordValidation(prev => ({ ...prev, isTouched: true }));
                  if (formData.password !== formData.confirmPassword) {
                    setErrors(prev => ({
                      ...prev,
                      confirmPassword: 'Passwords do not match'
                    }));
                  }
                }}
                placeholder="Confirm your password"
                className={`${errors.confirmPassword ? 'error' : ''} ${confirmPasswordValidation.isTouched && !errors.confirmPassword ? (confirmPasswordValidation.isValid ? 'valid' : 'invalid') : ''}`}
                disabled={isLoading}
                error={!!errors.confirmPassword}
              />
              {confirmPasswordValidation.isTouched && !errors.confirmPassword && (
                <span className={`validation-indicator ${confirmPasswordValidation.isValid ? 'valid' : 'invalid'}`}>
                  {confirmPasswordValidation.isValid ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="form-group role-selection">
              <label className="role-label">I want to register as:</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === 'buyer'}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span className="role-text">Buyer</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span className="role-text">Seller</span>
                </label>
              </div>
            </div>
          )}

          {errors.form && (
            <div className="form-error">
              {errors.form}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Please wait...
              </>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={toggleMode} className="toggle-btn" disabled={isLoading}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

