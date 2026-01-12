export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'M1Cart',
  title: import.meta.env.VITE_APP_TITLE || 'M1Cart - Your Shopping Destination'
};

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};

export const imageConfig = {
  cdnBaseURL: import.meta.env.VITE_IMAGE_CDN_BASE_URL || 'https://images.unsplash.com',
};

export default {
  app: appConfig,
  api: apiConfig,
  image: imageConfig,
};
