import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and React DOM into their own chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate Stripe into its own chunk (only loaded on checkout)
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          // Separate WhatsApp widget into its own chunk
          'whatsapp-vendor': ['react-floating-whatsapp'],
        }
      }
    }
  }
})
