const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Helper function to create a timeout promise
const createTimeout = (ms) => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
  );
};

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper to set user data in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper to get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
};

// Helper to get auth headers for protected requests
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function for fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Helper to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Login function
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

// Register function
export const register = async (userData) => {
  try {
    // Map frontend field names to backend expected names
    const backendData = {
      name: userData.Username || userData.name || userData.Name,
      email: userData.Email || userData.email || userData.EmailAddress,
      password: userData.password || userData.Password,
      role: userData.role || 'buyer',
      businessName: userData.businessName
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

// Get user profile
export const getProfile = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
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

// Save cart to backend
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

// Load cart from backend
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

// API functions for products
export const fetchProducts = async (page = 1, limit = 10, filters = {}) => {
  try {
    // Build query string with pagination and filter parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Add filter parameters if provided
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await handleResponse(response);
    
    // Return both products and pagination metadata
    return {
      products: data.products.map(product => ({
        pid: product.pid,
        id: product.pid, // Keep id for backward compatibility
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        description: product.description,
        rating: product.rating || 4.5,
        inStock: product.inStock !== undefined ? product.inStock : true
      })),
      pagination: data.pagination
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Products request timed out. Please try again.');
    }
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const data = await handleResponse(response);
    
    // Backend already returns array of categories, so just add 'All'
    return ['All', ...data];
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Categories request timed out. Please try again.');
    }
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchProductById = async (pid) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${pid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    const product = await handleResponse(response);
    return {
      pid: product.pid,
      id: product.pid, // Keep id for backward compatibility
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      rating: product.rating || 4.5,
      inStock: product.inStock !== undefined ? product.inStock : true,
      sellerBusinessName: product.user?.businessName || product.user?.name || ''
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Product request timed out. Please try again.');
    }
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/createProduct`, {
      method: 'POST',
      body: JSON.stringify(productData),
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Create product request timed out. Please try again.');
    }
    console.error('Error creating product:', error);
    throw error;
  }
};

// Get seller's products (authenticated) - with optional status filter
export const getMyProducts = async (status = null) => {
  try {
    let url = `${API_BASE_URL}/products/my-products`;
    
    // Add status filter if provided
    if (status && status !== 'all') {
      const params = new URLSearchParams({ status });
      url += `?${params.toString()}`;
    }
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch my products: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('My products request timed out. Please try again.');
    }
    console.error('Error fetching my products:', error);
    throw error;
  }
};

export const updateProduct = async (pid, productData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update product request timed out. Please try again.');
    }
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (pid) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${pid}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Delete product request timed out. Please try again.');
    }
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get latest product ID
export const getLatestProductId = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/latest-pid`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch latest product ID: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Latest product ID request timed out. Please try again.');
    }
    console.error('Error fetching latest product ID:', error);
    throw error;
  }
};

// Get all products for admin (including Submitted, Approved, Rejected)
export const getAllProducts = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Add filter parameters if provided
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/all?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch all products: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('All products request timed out. Please try again.');
    }
    console.error('Error fetching all products:', error);
    throw error;
  }
};

// Update product status (approve/reject) - now accepts optional rejectionReason
export const updateProductStatus = async (pid, status, rejectionReason = null) => {
  try {
    const body = { status };
    
    // Add rejection reason if status is Rejected
    if (status === 'Rejected' && rejectionReason) {
      body.rejectionReason = rejectionReason;
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/updateStatus/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product status: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update product status request timed out. Please try again.');
    }
    console.error('Error updating product status:', error);
    throw error;
  }
};

// ============ PAYMENT API FUNCTIONS ============

// Create a payment intent
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

// Handle payment success
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

// Get order status
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

// Verify payment status
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

// Get all orders for the authenticated user
export const getOrders = async (page = 1, limit = 10, status = null) => {
  try {
    // Build query string with pagination and filter parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Add status filter if provided
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

// Get all orders for admin
export const getAllOrders = async (page = 1, limit = 20, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/admin/orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to fetch all orders. Please try again.');
    }
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Get orders for seller (orders containing their products)
export const getSellerOrders = async (page = 1, limit = 20, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment/seller/orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Failed to fetch seller orders. Please try again.');
    }
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

// Update order status for seller (dispatched, returned, unfilled)
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

// Update order status for admin (delivered, cancelled, refunded)
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

// ============ COMMENT API FUNCTIONS ============

// Add a comment to a product
export const addComment = async (pid, commentData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments`, {
      method: 'POST',
      body: JSON.stringify({ pid, ...commentData }),
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add comment: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Add comment request timed out. Please try again.');
    }
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Fetch comments for a product
export const fetchComments = async (pid, page = 1, limit = 10) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/comments/product/${pid}?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch comments request timed out. Please try again.');
    }
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update comment: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update comment request timed out. Please try again.');
    }
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete comment: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Delete comment request timed out. Please try again.');
    }
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Fetch rating stats for a product
export const fetchRatingStats = async (pid) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/stats/${pid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rating stats: ${response.status}`);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch rating stats request timed out. Please try again.');
    }
    console.error('Error fetching rating stats:', error);
    throw error;
  }
};

// ============ USER API FUNCTIONS ============

// Get all users (admin only) - with pagination and optional role filter
export const getAllUsers = async (page = 1, limit = 10, roleFilter = 'all') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Add role filter if provided and not 'all'
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

// Update user (admin can update name, businessName, role)
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

// Change user password (admin verified)
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

// Deactivate user account
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

// Send verification OTP to user's email
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

// Verify OTP and mark account as verified
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
    
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Verify OTP request timed out. Please try again.');
    }
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
