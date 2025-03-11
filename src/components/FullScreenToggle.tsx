import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import { isMobileDevice, isFullscreenSupported, isInFullscreen, toggleFullscreen, addFullscreenChangeListener } from '../utils/fullScreenMode';
import './FullScreenToggle.scss';

const FullScreenToggle: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Only show the button on mobile devices that support fullscreen
    const isMobile = isMobileDevice();
    const isSupported = isFullscreenSupported();
    setShowButton(isMobile && isSupported);

    // Set initial fullscreen state
    setIsFullScreen(isInFullscreen());

    // Add listener for fullscreen changes
    const removeListener = addFullscreenChangeListener((fullscreenState) => {
      setIsFullScreen(fullscreenState);
    });

    return () => {
      // Clean up listener when component unmounts
      removeListener();
    };
  }, []);

  const handleToggleFullScreen = async () => {
    const newState = await toggleFullscreen();
    setIsFullScreen(newState);
  };

  if (!showButton) {
    return null;
  }

  return (
    <div className="fullscreen-toggle" onClick={handleToggleFullScreen}>
      <FontAwesomeIcon 
        icon={isFullScreen ? faCompress : faExpand} 
        size="lg" 
        className="fullscreen-icon"
      />
    </div>
  );
};

export default FullScreenToggle;