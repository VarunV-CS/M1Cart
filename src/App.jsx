import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppProvider from './context/AppProvider';
import Navigation from './components/Navigation';
import NotificationDisplay from './components/NotificationDisplay';
import { useTheme } from './context/ThemeContext';
import withErrorBoundary from './hocs/withErrorBoundary';
import { Spinner } from './components/patterns';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const Search = lazy(() => import('./components/Search'));
const ItemDescription = lazy(() => import('./components/ItemDescription'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductList = lazy(() => import('./components/ProductList'));
const PatternShowcase = lazy(() => import('./components/PatternShowcase'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));

// Wrap pages with error boundaries
const SafeHome = withErrorBoundary(Home);
const SafeCategories = withErrorBoundary(Categories);
const SafeSearch = withErrorBoundary(Search);
const SafeItemDescription = withErrorBoundary(ItemDescription);
const SafeCart = withErrorBoundary(Cart);
const SafeProductList = withErrorBoundary(ProductList);
const SafePatternShowcase = withErrorBoundary(PatternShowcase);
const SafeLogin = withErrorBoundary(Login);
const SafeDashboard = withErrorBoundary(Dashboard);
const SafeAdminDashboard = withErrorBoundary(AdminDashboard);
const SafeSellerDashboard = withErrorBoundary(SellerDashboard);

// Improved Suspense fallback with Spinner
const LoadingFallback = () => (
  <Spinner 
    size="large" 
    text="Loading page..." 
    variant="spinner"
    fullHeight={true}
  />
);

function AppContent() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className={`app theme-${theme}`}>
        <Navigation />
        <NotificationDisplay />
        <Suspense fallback={<LoadingFallback />}>
          <div className="routes-container">
            <Routes>
              <Route path="/" element={<SafeHome />} />
              <Route path="/categories" element={<SafeCategories />} />
              <Route path="/search" element={<SafeSearch />} />
              <Route path="/product/:pid" element={<SafeItemDescription />} />
              <Route path="/cart" element={<SafeCart />} />
              {/* <Route path="/products" element={<SafeProductList />} /> */}
              <Route path="/patterns" element={<SafePatternShowcase />} />
              <Route path="/login" element={<SafeLogin />} />
              <Route path="/dashboard" element={<SafeDashboard />} />
              <Route path="/admin-dashboard" element={<SafeAdminDashboard />} />
              <Route path="/seller-dashboard" element={<SafeSellerDashboard />} />
            </Routes>
          </div>
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
