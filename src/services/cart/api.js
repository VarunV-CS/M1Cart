import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getAuthHeaders } from '../auth/storage';

export const saveCart = async (cartItems) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/cart`, {
      method: 'POST',
      body: JSON.stringify({ cart: cartItems }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Cart save request timed out. Please try again.');
    }
    console.error('Save cart error:', error);
    throw error;
  }
};

export const loadCart = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/cart`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Cart load request timed out. Please try again.');
    }
    console.error('Load cart error:', error);
    throw error;
  }
};
