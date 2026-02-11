const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
      role: userData.role || 'buyer'
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
export const fetchProducts = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await handleResponse(response);
    
    return data.map(product => ({
      pid: product.pid,
      id: product.pid, // Keep id for backward compatibility
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      rating: product.rating || 4.5,
      inStock: product.inStock !== undefined ? product.inStock : true
    }));
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
      inStock: product.inStock !== undefined ? product.inStock : true
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
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

