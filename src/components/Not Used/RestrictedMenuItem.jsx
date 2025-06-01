import React, { useState } from 'react';
import { hasAccess, getFeatureUnavailableMessage } from '../licensing/FeatureAccess';
import './RestrictedMenuItem.css';

/**
 * A menu item that can be restricted based on license features
 * @param {Object} props - Component props
 * @param {string} props.featureKey - The feature key required for this menu item
 * @param {Function} props.onClick - Click handler for the menu item
 * @param {React.ReactNode} props.children - Content of the menu item
 * @param {string} [props.className] - Additional CSS class
 * @returns {JSX.Element} Rendered component
 */
const RestrictedMenuItem = ({ featureKey, onClick, children, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isAccessible = hasAccess(featureKey);
  
  const handleClick = (e) => {
    if (isAccessible && onClick) {
      onClick(e);
    } else {
      e.preventDefault();
      e.stopPropagation();
      setShowTooltip(true);
      
      // Hide tooltip after a delay
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }
  };
  
  const handleMouseEnter = () => {
    if (!isAccessible) {
      setShowTooltip(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  return (
    <div 
      className={`restricted-menu-item ${!isAccessible ? 'restricted' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {!isAccessible && <span className="lock-icon">🔒</span>}
      
      {showTooltip && !isAccessible && (
        <div className="feature-tooltip">
          {getFeatureUnavailableMessage(featureKey)}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default RestrictedMenuItem;