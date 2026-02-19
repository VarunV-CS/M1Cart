import { Button, Card } from './patterns';
import { useNavigate } from 'react-router-dom';
import withCartActions from '../hocs/withCartActions';
import './CartSummary.css';

const CartSummary = ({ 
  cartItems, 
  getCartTotal, 
  getCartItemsCount,
  clearCart,
  className = '' 
}) => {
  const navigate = useNavigate();
  const total = getCartTotal();
  const itemCount = getCartItemsCount();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Card className={`cart-summary ${className}`}>
      <Card.Header>
        <h3>Order Summary</h3>
      </Card.Header>
      <Card.Body>
        <div className="summary-row">
          <span className="summary-label">Items ({itemCount}):</span>
          <span className="summary-value">${total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Shipping:</span>
          <span className="summary-value">FREE</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Tax:</span>
          <span className="summary-value">Calculated at checkout</span>
        </div>
      </Card.Body>
      <Card.Footer>
        <div className="summary-total">
          <span className="total-label">Total:</span>
          <span className="total-value">${total.toFixed(2)}</span>
        </div>
        <Button 
          className="checkout-button"
          onClick={handleCheckout}
          disabled={itemCount === 0}
          variant="primary"
        >
          Proceed to Checkout
        </Button>
        {itemCount > 0 && (
          <Button 
            className="clear-button"
            onClick={clearCart}
            variant="danger"
          >
            Clear Cart
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};

export default withCartActions(CartSummary);
