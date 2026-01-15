import { useEffect } from 'react';

const withLogger = (WrappedComponent, componentName = 'Component') => {
  return function WithLoggerComponent(props) {
    useEffect(() => {
      console.log(`${componentName} mounted`);
      return () => {
        console.log(`${componentName} unmounted`);
      };
    }, []);

    useEffect(() => {
      console.log(`${componentName} props changed:`, props);
    });

    return <WrappedComponent {...props} />;
  };
};

export default withLogger;