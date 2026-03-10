import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/components/Footer.css';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <div className="footer-wrapper">
      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <img 
              src={isDark ? '/White_Name.png' : '/logo_small_zoom.png'} 
              alt="M1 Cart" 
              className="footer-logo" 
            />
            <p>Accelerating commerce to the redline. The ultimate shopping destination for speed enthusiasts.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/categories">New Arrivals</Link>
            <Link to="/categories">Best Sellers</Link>
            <Link to="/categories">Sale</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/orders">Order Status</Link>
            <Link to="/orders">Shipping</Link>
            <Link to="/orders">Returns</Link>
          </div>
        </div>
        <div className="home-container footer-bottom">
          <p>© 2026 M1 Cart. All rights reserved.</p>
          <div>
            <Link to="https://www.termsfeed.com/live/3e0daa63-3e3f-4319-a2a8-1355781083c8">Privacy Policy</Link>
            <Link to="https://www.termsfeed.com/live/118c3e3e-c0b7-4da3-8105-410b6b6c7e19">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

