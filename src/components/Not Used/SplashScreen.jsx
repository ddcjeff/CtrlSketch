import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import licenseManager from '../licensing/LicenseManager';

/**
 * Animated splash screen component shown at application startup
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback when splash screen animation is complete
 * @param {string} props.version - Application version string
 * @returns {JSX.Element} Rendered component
 */
const SplashScreen = ({ onComplete, version = '1.0.0' }) => {
  const [animationState, setAnimationState] = useState('start');
  const [licenseInfo, setLicenseInfo] = useState(null);
  
  // Progress through animation states
  useEffect(() => {
    const getStartupInfo = async () => {
      try {
        // Get license information if available
        const license = licenseManager.getLicenseStatus();
        setLicenseInfo(license);
      } catch (error) {
        console.error("Error getting license status:", error);
        // Continue with default license info if there's an error
      }
      
      // Ensure we start with the 'start' state
      setAnimationState('start');
      
      // Start animation sequence with a slight delay
      setTimeout(() => setAnimationState('logo-appear'), 300);
      setTimeout(() => setAnimationState('draw-lines'), 1200);
      setTimeout(() => setAnimationState('show-text'), 2000);
      setTimeout(() => setAnimationState('complete'), 3500);
      
      // Complete the splash screen after animations
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);
    };
    
    getStartupInfo();
  }, [onComplete]);
  
  // Format the license type for display
  const formatLicenseType = (type) => {
    if (!type) return 'Unregistered';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  console.log("Rendering SplashScreen with state:", animationState);
  
  return (
    <div className={`splash-screen ${animationState}`}>
      <div className="splash-content">
        <div className="logo-container">
          {/* Grid lines that animate in */}
          <div className="grid-lines">
            {[...Array(8)].map((_, i) => (
              <div key={`h-${i}`} className={`h-line line-${i}`}></div>
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v-${i}`} className={`v-line line-${i}`}></div>
            ))}
          </div>
          
          {/* Compass drawing shape that animates in */}
          <div className="compass">
            <div className="compass-circle"></div>
            <div className="compass-needle"></div>
          </div>
          
          {/* App logo */}
          <div className="app-logo">
            <span className="logo-ctrl">Ctrl</span>
            <span className="logo-sketch">Sketch</span>
            <span className="logo-pro">Pro</span>
          </div>
        </div>
        
        {/* Animated blueprint elements */}
        <div className="blueprint-elements">
          <div className="blueprint-rect"></div>
          <div className="blueprint-circle"></div>
          <div className="blueprint-line"></div>
        </div>
        
        {/* Additional information */}
        <div className="app-info">
          <div className="version-info">Version {version}</div>
          {licenseInfo && (
            <div className="license-info">
              {formatLicenseType(licenseInfo.type)} Edition
              {licenseInfo.remainingDays && licenseInfo.status === 'trial' && (
                <span className="trial-days"> - {licenseInfo.remainingDays} days remaining</span>
              )}
            </div>
          )}
        </div>
        
        {/* Loading progress bar */}
        <div className="loading-bar">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;