import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './ScrollToTop.css';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top with animation
    const scrollToTop = () => {
      const scrollStep = -window.scrollY / (300 / 16); // 300ms at 60fps
      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep);
        } else {
          clearInterval(scrollInterval);
        }
      }, 16);
    };

    // Small delay to ensure page render before scrolling
    const timer = setTimeout(scrollToTop, 10);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

// Optional: Scroll to top button component
export function ScrollToTopButton() {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Get the hero section height for threshold
      const heroSection = document.querySelector('.home-hero');
      let threshold = 300; // Default for desktop
      
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        // Use hero height + some buffer for small/medium screens
        if (window.innerWidth <= 1024) {
          threshold = heroHeight + 50;
        }
      }
      
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    // Also check on resize to recalculate
    window.addEventListener('resize', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const scrollStep = -window.scrollY / (300 / 16);
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 16);
  };

  return (
    <button
      className={`scroll-to-top-button ${isDark ? 'dark' : 'light'} ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
}

