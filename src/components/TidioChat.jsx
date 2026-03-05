import { useEffect, useRef } from 'react';

const TIDIO_SCRIPT_URL = '//code.tidio.co/wbnavjkc3evyu5yxs0isnou2rh7no8ul.js';

// Configure Tidio settings globally BEFORE the script loads
window.tidioSettings = {
  position: 'right',
  background: '#25D366',
  bottom: 20,
  right: 20,
};

function TidioChat() {
  const isMounted = useRef(true);

  const loadTidio = () => {
    // If Tidio is already loaded, set position and show
    if (window.tidioChatApi) {
      window.tidioChatApi.setPosition('right');
      window.tidioChatApi.hide();
      setTimeout(() => {
        window.tidioChatApi?.show();
      }, 100);
      return;
    }

    // Load Tidio for the first time
    const script = document.createElement('script');
    script.src = TIDIO_SCRIPT_URL;
    script.async = true;
    script.setAttribute('data-tidio-position', 'right');
    document.body.appendChild(script);
    
    // Wait for script to load and then set position
    script.onload = () => {
      if (window.tidioChatApi && isMounted.current) {
        window.tidioChatApi.setPosition('right');
      }
    };
  };

  const unloadTidio = () => {
    // Remove Tidio script elements
    const scripts = document.querySelectorAll(`script[src="${TIDIO_SCRIPT_URL}"]`);
    scripts.forEach(script => script.remove());

    // Remove Tidio container if it exists
    const tidioContainer = document.getElementById('tidio-chat');
    if (tidioContainer) {
      tidioContainer.remove();
    }

    // Clear window.tidioChatApi if it exists
    if (window.tidioChatApi) {
      delete window.tidioChatApi;
    }
  };

  useEffect(() => {
    // Set up the global function on mount
    window.loadTidioChat = loadTidio;
    
    // Auto-load Tidio when component mounts
    loadTidio();
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      unloadTidio();
      delete window.loadTidioChat;
    };
  }, []);

  return null; // This component doesn't render anything
}

export default TidioChat;

