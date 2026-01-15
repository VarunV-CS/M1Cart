import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import Navigation from './components/Navigation';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const Search = lazy(() => import('./components/Search'));
const ItemDescription = lazy(() => import('./components/ItemDescription'));
const Cart = lazy(() => import('./pages/Cart'));

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navigation />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:id" element={<ItemDescription />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
