const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    
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
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    
    // Backend already returns array of categories, so just add 'All'
    return ['All', ...data];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchProductById = async (pid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${pid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const product = await response.json();
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
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (pid, productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${pid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (pid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${pid}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

