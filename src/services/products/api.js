import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getAuthHeaders } from '../auth/storage';

export const fetchProducts = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

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

    return {
      products: data.products.map((product) => ({
        pid: product.pid,
        id: product.pid,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        description: product.description,
        rating: product.rating || 4.5,
        inStock: product.inStock !== undefined ? product.inStock : true,
      })),
      pagination: data.pagination,
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

    return ['All', ...data];
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Categories request timed out. Please try again.');
    }
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchSearchSuggestions = async (query) => {
  try {
    const params = new URLSearchParams({ q: query.trim() });
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/suggestions?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch search suggestions: ${response.status}`);
    }

    const data = await handleResponse(response);
    return data.suggestions || [];
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Suggestions request timed out. Please try again.');
    }
    console.error('Error fetching search suggestions:', error);
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
      id: product.pid,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      rating: product.rating || 4.5,
      inStock: product.inStock !== undefined ? product.inStock : true,
      sellerBusinessName: product.user?.businessName || product.user?.name || '',
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

export const getMyProducts = async (status = null) => {
  try {
    let url = `${API_BASE_URL}/products/my-products`;

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

export const getAllProducts = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

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

export const updateProductStatus = async (pid, status, rejectionReason = null) => {
  try {
    const body = { status };

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
