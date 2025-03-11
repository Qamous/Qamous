/**
 * Utility functions for handling full-screen mode on mobile devices
 */

/**
 * Check if the current device is a mobile device
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return !!(  // Added double negation to ensure boolean return type
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /mobile|tablet/i.test(userAgent))
  );
};

/**
 * Check if the browser supports the Fullscreen API
 * @returns {boolean} True if the browser supports fullscreen, false otherwise
 */
export const isFullscreenSupported = (): boolean => {
  return (
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
};

/**
 * Check if the document is currently in fullscreen mode
 * @returns {boolean} True if in fullscreen mode, false otherwise
 */
export const isInFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * Request fullscreen mode
 * @param {HTMLElement} element - The element to make fullscreen (usually document.documentElement)
 * @returns {Promise<void>}
 */
export const enterFullscreen = async (element: HTMLElement = document.documentElement): Promise<void> => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }
  } catch (error) {
    console.error('Error attempting to enter fullscreen:', error);
  }
};

/**
 * Exit fullscreen mode
 * @returns {Promise<void>}
 */
export const exitFullscreen = async (): Promise<void> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.error('Error attempting to exit fullscreen:', error);
  }
};

/**
 * Toggle fullscreen mode
 * @returns {Promise<boolean>} True if entered fullscreen, false if exited
 */
export const toggleFullscreen = async (): Promise<boolean> => {
  if (isInFullscreen()) {
    await exitFullscreen();
    return false;
  } else {
    await enterFullscreen();
    return true;
  }
};

/**
 * Add a fullscreen change event listener
 * @param {Function} callback - Function to call when fullscreen state changes
 * @returns {Function} Function to remove the event listener
 */
export const addFullscreenChangeListener = (callback: (isFullscreen: boolean) => void): () => void => {
  const handler = () => {
    callback(isInFullscreen());
  };

  document.addEventListener('fullscreenchange', handler);
  document.addEventListener('webkitfullscreenchange', handler);
  document.addEventListener('mozfullscreenchange', handler);
  document.addEventListener('MSFullscreenChange', handler);

  return () => {
    document.removeEventListener('fullscreenchange', handler);
    document.removeEventListener('webkitfullscreenchange', handler);
    document.removeEventListener('mozfullscreenchange', handler);
    document.removeEventListener('MSFullscreenChange', handler);
  };
};