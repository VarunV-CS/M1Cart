import { CartProvider } from './CartContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';

export const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <CartProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CartProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
