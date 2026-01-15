import { useState } from 'react';

const withLoading = (WrappedComponent) => {
  const WithLoadingComponent = ({ loading: externalLoading, ...props }) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const loading = externalLoading !== undefined ? externalLoading : internalLoading;

    const setLoading = (newLoadingState) => {
      setInternalLoading(newLoadingState);
    };

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      );
    }

    return <WrappedComponent {...props} setLoading={setLoading} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLoadingComponent;
};

export default withLoading;