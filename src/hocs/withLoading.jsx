import { useState } from 'react';

const withLoading = (WrappedComponent) => {
  const WithLoadingComponent = (props) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const loading = props.loading !== undefined ? props.loading : internalLoading;

    const setLoading = (newLoadingState) => {
      setInternalLoading(newLoadingState);
    };

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} setLoading={setLoading} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLoadingComponent;
};

export default withLoading;