/**
 * Utility to defer loading of Google AdSense scripts until after the page content has loaded
 */

const loadAdScript = () => {
  // Check if the script is already loaded
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return;
  }

  // Create the AdSense script element
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4293590491700199';
  adScript.crossOrigin = 'anonymous';
  
  // Append the script to the document
  document.head.appendChild(adScript);
  
  console.log('AdSense script loaded deferred');
};

/**
 * Initialize the deferred loading of ads
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Optional delay in milliseconds before loading ads
 * @param {boolean} options.waitForInteraction - Whether to wait for user interaction before loading ads
 */
export const initDeferredAds = (options = {}) => {
  const { delay = 0, waitForInteraction = false } = options;
  
  // Function to load ads after specified conditions
  const loadAds = () => {
    if (delay > 0) {
      setTimeout(loadAdScript, delay);
    } else {
      loadAdScript();
    }
  };

  // Load ads when the page is fully loaded
  if (document.readyState === 'complete') {
    loadAds();
  } else {
    window.addEventListener('load', loadAds);
  }

  // Additionally load ads on user interaction if specified
  if (waitForInteraction) {
    const interactionEvents = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    
    const handleInteraction = () => {
      loadAdScript();
      // Remove all event listeners after first interaction
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }
};

/**
 * Initialize AdSense ads with default settings
 * This is a convenience function to use in the main application
 */
export const initAds = () => {
  initDeferredAds({
    delay: 1000, // 1 second delay after page load
    waitForInteraction: true
  });
};