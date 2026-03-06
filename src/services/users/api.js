import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getAuthHeaders } from '../auth/storage';

export const getAllUsers = async (page = 1, limit = 10, roleFilter = 'all') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (roleFilter && roleFilter !== 'all') {
      params.append('role', roleFilter);
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/all-users?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Get users request timed out. Please try again.');
    }
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/update-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update user request timed out. Please try again.');
    }
    console.error('Error updating user:', error);
    throw error;
  }
};

export const changeUserPassword = async (userId, newPassword, adminPassword) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/change-user-password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword, adminPassword }),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Change password request timed out. Please try again.');
    }
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deactivateUser = async (userId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/deactivate-user/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate user: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Deactivate user request timed out. Please try again.');
    }
    console.error('Error deactivating user:', error);
    throw error;
  }
};
