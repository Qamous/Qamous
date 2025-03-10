/**
 * Utility to defer loading of Google AdSense scripts until after the page content has loaded
 */

/**
 * Options for initializing deferred ads
 */
interface DeferredAdsOptions {
  /**
   * Optional delay in milliseconds before loading ads
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether to wait for user interaction before loading ads
   * @default false
   */
  waitForInteraction?: boolean;
}

/**
 * Loads the AdSense script if it hasn't been loaded already
 */
const loadAdScript = (): void => {
  // Check if the script is already loaded
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return;
  }

  // Create the AdSense script element
  const adScript: HTMLScriptElement = document.createElement('script');
  adScript.async = true;
  adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4293590491700199';
  adScript.crossOrigin = 'anonymous';
  
  // Append the script to the document
  document.head.appendChild(adScript);
  
  //console.log('AdSense script loaded deferred');
};

/**
 * Initialize the deferred loading of ads
 * @param options - Configuration options
 */
export const initDeferredAds = (options: DeferredAdsOptions = {}): void => {
  const { delay = 0, waitForInteraction = false } = options;
  
  // Function to load ads after specified conditions
  const loadAds = (): void => {
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
    const interactionEvents: string[] = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    
    const handleInteraction = (): void => {
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
export const initAds = (): void => {
  initDeferredAds({
    delay: 1000, // 1 second delay after page load
    waitForInteraction: true
  });
};