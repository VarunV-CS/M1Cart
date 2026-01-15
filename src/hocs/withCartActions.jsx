import { useCart } from '../context/CartContext';

const withCartActions = (WrappedComponent) => {
  const WithCartActionsComponent = (props) => {
    const cartActions = useCart();

    return <WrappedComponent {...props} {...cartActions} />;
  };

  WithCartActionsComponent.displayName = `withCartActions(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithCartActionsComponent;
};

export default withCartActions;