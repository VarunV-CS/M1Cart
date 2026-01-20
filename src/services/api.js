const API_BASE_URL = 'https://api.escuelajs.co/api/v1';

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();

    return data.map(product => ({
      id: product.id,
      name: product.title,
      category: product.category.name,
      price: product.price,
      image: product.images[0] || '', // Take first image
      description: product.description,
      rating: 4.5, // Mock rating
      inStock: true 
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();

    const categoryNames = data
      .map(cat => cat.name)
      .filter(name => !['string', 'category_B', 'Testing Category'].includes(name));
    return ['All', ...categoryNames];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const product = await response.json();
    return {
      id: product.id,
      name: product.title,
      category: product.category.name,
      price: product.price,
      image: product.images[0] || '',
      description: product.description,
      rating: 4.5,
      inStock: true
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};