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

export const stripeConfig = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_stripe_public_key',
};

export const whatsappConfig = {
  phoneNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890',
  accountName: import.meta.env.VITE_WHATSAPP_ACCOUNT_NAME || 'M1Cart Support',
  avatar: import.meta.env.VITE_WHATSAPP_AVATAR || '/logo_small.png',
  statusMessage: import.meta.env.VITE_WHATSAPP_STATUS || 'Available 24/7!',
  chatMessage: import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hello! How can we assist you today?',
  placeholder: import.meta.env.VITE_WHATSAPP_PLACEHOLDER || 'Type a message...',
};

export default {
  app: appConfig,
  api: apiConfig,
  image: imageConfig,
  stripe: stripeConfig,
  whatsapp: whatsappConfig,
};
