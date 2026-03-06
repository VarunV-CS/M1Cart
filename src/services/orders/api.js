import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getAuthHeaders } from '../auth/storage';

export const createPaymentIntent = async (amount, items) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify({ amount, items }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Payment request timed out. Please try again.');
    }
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const handlePaymentSuccess = async (paymentIntentId, orderId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/payment-success`, {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, orderId }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Payment success notification timed out.');
    }
    console.error('Error handling payment success:', error);
    throw error;
  }
};

export const getOrderStatus = async (orderId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/order/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Order status request timed out.');
    }
    console.error('Error getting order status:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentIntentId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Payment verification timed out.');
    }
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const getOrders = async (page = 1, limit = 10, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to fetch orders. Please try again.');
    }
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getAllOrders = async (page = 1, limit = 20, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/payment/admin/orders?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to fetch all orders. Please try again.');
    }
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const getSellerOrders = async (page = 1, limit = 20, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/payment/seller/orders?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to fetch seller orders. Please try again.');
    }
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

export const updateSellerOrderStatus = async (orderId, status) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/seller/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to update order status. Please try again.');
    }
    console.error('Error updating seller order status:', error);
    throw error;
  }
};

export const updateAdminOrderStatus = async (orderId, status) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to update order status. Please try again.');
    }
    console.error('Error updating admin order status:', error);
    throw error;
  }
};
