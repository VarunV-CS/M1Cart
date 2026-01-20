import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppProvider from './context/AppProvider';
import Navigation from './components/Navigation';
import NotificationDisplay from './components/NotificationDisplay';
import { useTheme } from './context/ThemeContext';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const Search = lazy(() => import('./components/Search'));
const ItemDescription = lazy(() => import('./components/ItemDescription'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductList = lazy(() => import('./components/ProductList'));
const PatternShowcase = lazy(() => import('./components/PatternShowcase'));

function AppContent() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className={`app theme-${theme}`}>
        <Navigation />
        <NotificationDisplay />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ItemDescription />} />
            <Route path="/cart" element={<Cart />} />
            {/* <Route path="/products" element={<ProductList />} /> */}
            <Route path="/patterns" element={<PatternShowcase />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
