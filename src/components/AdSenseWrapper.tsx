import React, { useEffect, useRef } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface AdSenseWrapperProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
  className?: string;
  adKey?: string; // Unique identifier for the ad
}

const AdSenseWrapper: React.FC<AdSenseWrapperProps> = ({
  client,
  slot,
  format = 'auto',
  responsive = 'true',
  style = {},
  className = '',
  adKey = slot, // Default to using slot as the key
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adId = `ad-${slot}-${adKey}`;

  useEffect(() => {
    if (!adRef.current) return;

    // Create the ad element
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.dataset.adClient = client;
    adElement.dataset.adSlot = slot;
    if (format) adElement.dataset.adFormat = format;
    if (responsive) adElement.dataset.adResponsive = responsive;

    // Clear existing content and append new ad
    adRef.current.innerHTML = '';
    adRef.current.appendChild(adElement);

    // Initialize the ad
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }

    // Cleanup function
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [client, slot, format, responsive]);

  // Fallback UI in case of ad error
  const adErrorFallback = (
    <div 
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--tertiary-color)',
        color: 'var(--primary-color)',
        padding: '10px',
        textAlign: 'center',
        fontSize: '0.8rem',
        minHeight: '90px',
      }}
      className={className}
    >
      <p>Advertisement</p>
    </div>
  );

  return (
    <ErrorBoundary fallback={adErrorFallback}>
      <div 
        ref={adRef} 
        id={adId} 
        className={`adsense-container ${className}`}
        style={style}
      />
    </ErrorBoundary>
  );
};

export default AdSenseWrapper;