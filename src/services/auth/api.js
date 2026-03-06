import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getUser, getAuthHeaders, setUser } from './storage';

export const login = async (email, password) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Login request timed out. Please try again.');
    }
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const backendData = {
      name: userData.Username || userData.name || userData.Name,
      email: userData.Email || userData.email || userData.EmailAddress,
      password: userData.password || userData.Password,
      role: userData.role || 'buyer',
      businessName: userData.businessName,
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(backendData),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Registration request timed out. Please try again.');
    }
    console.error('Registration error:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Profile request timed out. Please try again.');
    }
    console.error('Get profile error:', error);
    throw error;
  }
};

export const sendVerificationOTP = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/send-verification-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to send verification OTP: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Send verification OTP request timed out. Please try again.');
    }
    console.error('Error sending verification OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (otp) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify OTP: ${response.status}`);
    }

    const data = await handleResponse(response);

    if (data?.success) {
      const currentUser = getUser();
      if (currentUser) {
        setUser({ ...currentUser, isVerified: true });
      }
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Verify OTP request timed out. Please try again.');
    }
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/update-password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to update password: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update password request timed out. Please try again.');
    }
    console.error('Error updating password:', error);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Email check request timed out. Please try again.');
    }
    console.error('Error checking email:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const resetUrl =
      typeof window === 'undefined' ? '/reset' : `${window.location.origin}/reset`;

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email, resetUrl }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Reset link request timed out. Please try again.');
    }
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Password reset request timed out. Please try again.');
    }
    console.error('Error resetting password with token:', error);
    throw error;
  }
};
