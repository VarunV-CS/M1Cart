import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchProducts } from '../services/api';
import { Spinner } from '../components/patterns';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const location = useLocation();
  const { addToCart } = useCart();
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const [isWatermarkHovered, setIsWatermarkHovered] = useState(false);
  const [watermarkPhase, setWatermarkPhase] = useState('idle');
  const [isProductsVisible, setIsProductsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sceneRefs = useRef([]);
  const productsSectionRef = useRef(null);
  const storyPanelsRef = useRef(null);
  const watermarkExitTimerRef = useRef(null);
  const watermarkResetTimerRef = useRef(null);

  const storyScenes = [
    {
      label: '01 / Product Discovery',
      title: 'Spot the right product before you stop scrolling',
      text: 'Search signal, stock status, and key product context stay readable so discovery feels instant.',
    },
    {
      label: '02 / Momentum',
      title: 'Move from interest to cart in one clean motion',
      text: 'Every card is tuned for speed: image focus, glanceable price, and direct add-to-cart action.',
    },
    {
      label: '03 / Confidence',
      title: 'Checkout-ready choices without second guessing',
      text: 'Ratings and category hints help users decide faster while keeping the page visually light.',
    },
  ];

  const featureHighlights = [
    {
      label: `04 / Speed Driven Design`,
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Our delivery times rival pit stops. Get your gear before the engine cools down.',
      details: ['Checkout flow optimized for speed', 'Faster product-to-cart decision path'],
    },
    {
      label: `05 / Secure Transactions`,
      icon: '🛡️',
      title: 'Secure Pit',
      description: 'Your transactions are protected with championship-level security protocols.',
      details: ['Hardened payment flow across sessions', 'Safety cues visible before checkout'],
    },
    {
      label: `06 / Global Reach`,
      icon: '🌍',
      title: 'Global Track',
      description: 'We ship worldwide. No circuit is too far for our logistics team.',
      details: ['Global-ready product discovery', 'Fulfillment confidence for every region'],
    },
  ];

  const narrativePanels = [
    ...storyScenes.map((scene) => ({ ...scene, kind: 'story' })),
    ...featureHighlights.map((feature, index) => ({
      label: feature.label,
      title: feature.title,
      text: feature.description,
      kind: 'benefit',
      icon: feature.icon,
      details: feature.details,
    })),
  ];

  const getRetryDelay = (count) => Math.min(1000 * Math.pow(2, count), 8000);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProducts(1, 12, { sortBy: 'createdAt-asc' });
      const productsArray = Array.isArray(data) ? data : data.products || [];
      setProducts(productsArray);

      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [location.pathname]);

  useEffect(() => {
    if (error && retryCount > 0 && retryCount <= 4) {
      const timer = setTimeout(() => {
        console.log(`Retrying fetch (attempt ${retryCount}/${4})...`);
        loadProducts();
      }, getRetryDelay(retryCount - 1));

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [error, retryCount]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    // Check if mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    let rafId = null;

    const updateActiveScene = () => {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight * 0.45;
      let closestIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      sceneRefs.current.forEach((element, index) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        
        // Mobile: detect based on which panel is most visible in viewport
        if (window.innerWidth <= 640) {
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const elementHeight = rect.height;
          
          // Calculate how much of the element is visible
          const visibleTop = Math.max(0, elementTop);
          const visibleBottom = Math.min(viewportHeight, elementBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibilityRatio = visibleHeight / elementHeight;
          
          // Also consider proximity to center
          const elementCenter = elementTop + elementHeight / 2;
          const distanceFromCenter = Math.abs(elementCenter - viewportHeight * 0.5);
          
          // Score: higher visibility and closer to center = better
          const score = visibilityRatio * 100 - distanceFromCenter * 0.1;
          
          if (score > (100 - smallestDistance * 0.1)) {
            smallestDistance = 100 - score;
            closestIndex = index;
          }
        } else {
          // Desktop/Tablet: use center-based detection
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - viewportCenter);

          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestIndex = index;
          }
        }
      });

      setActiveScene(closestIndex);
    };

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(updateActiveScene);
    };

    updateActiveScene();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [loading]);

  useEffect(() => {
    if (loading || !productsSectionRef.current || isProductsVisible) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsProductsVisible(true);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(productsSectionRef.current);

    return () => observer.disconnect();
  }, [loading, isProductsVisible]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    if (retryCount === 0) {
      loadProducts();
    }
  };

  useEffect(() => {
    return () => {
      if (watermarkExitTimerRef.current) {
        clearTimeout(watermarkExitTimerRef.current);
      }
      if (watermarkResetTimerRef.current) {
        clearTimeout(watermarkResetTimerRef.current);
      }
    };
  }, []);

  const baseWatermarkSrc = isDark ? '/White_Name_still.png' : '/Sprite_Name_still.png';

  const watermarkSrc = watermarkPhase === 'exiting'
    ? (isDark ? '/outline_zoom-4.png' : '/logo_small_zoom.png')
    : isWatermarkHovered
      ? (isDark ? '/outline_still-4.png' : '/logo_small_still.png')
      : baseWatermarkSrc;

  const handleWatermarkClick = () => {
    if (watermarkPhase !== 'idle') {
      return;
    }

    setIsWatermarkHovered(false);
    setWatermarkPhase('exiting');

    watermarkExitTimerRef.current = setTimeout(() => {
      setWatermarkPhase('reentering');
    }, 2800);

    watermarkResetTimerRef.current = setTimeout(() => {
      setWatermarkPhase('idle');
    }, 5000);
  };

  const featuredProducts = products.slice(0, 6);

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner size="large" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Unable to Load Products</h2>
          <p className="error-message">{error}</p>
          <p className="error-hint">
            {retryCount > 0 ? `Retrying... (attempt ${retryCount}/4)` : 'Please check your connection and try again.'}
          </p>
          <button onClick={handleRetry} className="retry-button">
            {retryCount > 0 ? 'Retry Again' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="home-hero home-section">
        <div className="hero-shell">
          <div className="hero-copy reveal-on-scroll">
            <p className="hero-kicker">M1 CART</p>
            <h1 className="hero-title">
              Experience Fast interfaces<span>for serious shoppers</span>
            </h1>
            <p className="hero-description">
              A cinematic commerce flow with smooth motion, high contrast hierarchy, and checkout-first clarity.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="hero-primary-cta">
                Start Engines
              </Link>
              <Link to="/categories" className="hero-secondary-cta">
                View Catalog
              </Link>
            </div>
          </div>
          <div className="hero-mark reveal-on-scroll">
            <img
              src={watermarkSrc}
              alt="M1 Cart"
              className={`hero-watermark ${watermarkPhase === 'exiting' ? 'is-exiting' : ''} ${watermarkPhase === 'reentering' ? 'is-reentering' : ''}`}
              onMouseEnter={() => setIsWatermarkHovered(true)}
              onMouseLeave={() => setIsWatermarkHovered(false)}
              onClick={handleWatermarkClick}
            />
          </div>
        </div>
      </section>

      <section className="home-story home-section">
        <div className="home-container story-grid">
          <div className="story-copy reveal-on-scroll">
            <p className="story-kicker">Store Narrative & Benefits</p>
            {/* Mobile progress indicator dots - inside story-copy for proper stacking */}
            {isMobile && (
              <div className="story-progress-dots">
                {narrativePanels.map((_, index) => (
                  <button
                    key={index}
                    className={`story-progress-dot ${activeScene === index ? 'is-active' : ''}`}
                    onClick={() => {
                      sceneRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    aria-label={`Go to panel ${index + 1}`}
                  />
                ))}
              </div>
            )}
            <div className="story-text-stack" aria-live="polite">
              {narrativePanels.map((scene, index) => (
                <article 
                  key={scene.label} 
                  className={`story-line ${activeScene === index ? 'is-active' : ''}`}
                  onClick={() => {
                    sceneRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      sceneRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  <p>{scene.label}</p>
                  <h2>{scene.title}</h2>
                  <p>{scene.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div
            className="story-panels"
            ref={storyPanelsRef}
          >
            {narrativePanels.map((scene, index) => {
              return (
              <article
                key={`${scene.label}-${scene.title}`}
                ref={(element) => {
                  sceneRefs.current[index] = element;
                }}
                className={`story-panel ${activeScene === index ? 'is-active' : ''}`}

              >
                <p className="story-panel-index">{scene.label}</p>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
                {scene.kind === 'benefit' && (
                  <div className="story-panel-benefit-meta">
                    <span className="story-benefit-icon" aria-hidden="true">
                      {scene.icon}
                    </span>
                    <ul>
                      {scene.details?.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-products home-section" ref={productsSectionRef}>
        <div className="home-container">
          <div className={`section-heading reveal-on-scroll ${isProductsVisible ? 'is-visible' : ''}`}>
            <h2>Pole Position Picks</h2>
          </div>
          <div className="home-products-grid">
            {featuredProducts.map((product, index) => {
              const productId = product.pid ?? product.id;
              return (
              <article
                className={`home-product-card reveal-on-scroll ${isProductsVisible ? 'is-visible' : ''}`}
                key={productId ?? product.name}
                style={{ '--delay': `${index * 60}ms` }}
              >
                <Link to={`/product/${productId}`} className="home-product-image-wrap">
                  <img src={product.image} alt={product.name} className="home-product-image" />
                </Link>
                <div className="home-product-details">
                  <div className="home-product-title-row">
                    <Link to={`/product/${productId}`} className="home-product-name">
                      {product.name}
                    </Link>
                    <span className="home-product-rating">★ {product.rating || 4.9}</span>
                  </div>
                  <p className="home-product-category">{product.category}</p>
                  <div className="home-product-footer">
                    <p className="home-product-price">${product.price?.toFixed(2) || '0.00'}</p>
                    <button
                      type="button"
                      className="home-add-button"
                      disabled={!product.inStock}
                      onClick={() => addToCart(product)}
                    >
                      {product.inStock ? 'Add' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
          <div className={`view-all reveal-on-scroll ${isProductsVisible ? 'is-visible' : ''}`}>
            <Link to="/categories" className="home-view-all-button">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
