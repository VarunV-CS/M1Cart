import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { createPaymentIntent, handlePaymentSuccess, verifyPayment, isAuthenticated } from '../services/api';
import { stripeConfig } from '../config/env';
import { Button, Card, Spinner } from '../components/patterns';
import './Checkout.css';

// Load Stripe with public key
const stripePromise = loadStripe(stripeConfig.publicKey);

const CheckoutForm = ({ total, items, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isDark } = useTheme();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const initPayment = async () => {
      try {
        const response = await createPaymentIntent(total, items);
        if (response.success) {
          setClientSecret(response.clientSecret);
          setOrderId(response.orderId);
        } else {
          setError(response.message || 'Failed to initialize payment');
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize payment');
      }
    };

    if (total > 0 && isAuthenticated()) {
      initPayment();
    }
  }, [total, items]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Notify backend of successful payment
        await handlePaymentSuccess(paymentIntent.id, orderId);
        
        // Verify payment with backend
        const verification = await verifyPayment(paymentIntent.id);
        
        if (verification.success) {
          onSuccess(paymentIntent.id, orderId);
        } else {
          setError('Payment verification failed. Please contact support.');
          setProcessing(false);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during payment');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDark ? '#f0f0f0' : '#424770',
        '::placeholder': {
          color: isDark ? '#888' : '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary"
          disabled={!stripe || processing || !clientSecret}
          className="pay-button"
        >
          {processing ? (
            <>
              <Spinner size="small" /> Processing...
            </>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="secondary"
          onClick={onCancel}
          disabled={processing}
          className="cancel-button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isDark } = useTheme();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication - redirect to login if not authenticated
    if (!isAuthenticated()) {
      // Store the intended destination
      navigate('/login', { state: { from: location.pathname, message: 'Please login to complete your purchase' } });
      return;
    }
    setIsLoading(false);
  }, [navigate, location]);

  const total = getCartTotal();

  const handlePaymentSuccess = (paymentId, orderId) => {
    setPaymentIntentId(paymentId);
    setOrderId(orderId);
    setIsPaymentSuccess(true);
    // Clear the cart after successful payment
    clearCart();
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className={`checkout-page ${isDark ? 'dark' : ''}`}>
        <div className="container">
          <div className="loading-container">
            <Spinner size="large" text="Loading checkout..." />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !isPaymentSuccess) {
    return (
      <div className={`checkout-page ${isDark ? 'dark' : ''}`}>
        <div className="container">
          <h1>Checkout</h1>
          <div className="empty-cart">
            <p>Your cart is empty. Add some items before checking out.</p>
            <Button onClick={() => navigate('/categories')} variant="primary">
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isPaymentSuccess) {
    return (
      <div className={`checkout-page ${isDark ? 'dark' : ''}`}>
        <div className="container">
          <Card className="success-card">
            <Card.Body>
              <div className="success-content">
                <div className="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p>Thank you for your order.</p>
                <div className="order-details">
                  <p><strong>Order ID:</strong> {orderId}</p>
                  <p><strong>Payment ID:</strong> {paymentIntentId}</p>
                  <p><strong>Amount Paid:</strong> ${total.toFixed(2)}</p>
                </div>
                <div className="success-actions">
                  <Button 
                    onClick={() => navigate('/categories')} 
                    variant="primary"
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={() => navigate('/')} 
                    variant="secondary"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`checkout-page ${isDark ? 'dark' : ''}`}>
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <Card className="order-summary-card">
            <Card.Header>
              <h3>Order Summary</h3>
            </Card.Header>
            <Card.Body>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.pid} className="order-item">
                    <div className="order-item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>
                <div className="total-row total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="payment-card">
            <Card.Header>
              <h3>Payment Details</h3>
            </Card.Header>
            <Card.Body>
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  total={total}
                  items={cartItems}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

