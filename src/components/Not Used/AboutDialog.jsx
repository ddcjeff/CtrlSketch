import React, { useState, useEffect } from 'react';
import licenseManager from '../licensing/LicenseManager';
import './AboutDialog.css';

/**
 * About dialog showing application information and license details
 * @param {Object} props - Component props
 * @param {string} props.version - Application version
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onManageLicense - Callback to open license management
 * @returns {JSX.Element} Rendered component
 */
const AboutDialog = ({ version = '1.0.0', onClose, onManageLicense }) => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  
  // Load license information on mount
  useEffect(() => {
    const info = licenseManager.getLicenseStatus();
    setLicenseInfo(info);
  }, []);
  
  // Format license type for display
  const formatLicenseType = (type) => {
    if (!type) return 'Unregistered';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <div className="dialog-overlay">
      <div className="about-dialog">
        <div className="dialog-header">
          <h2>About CtrlSketchPro</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="dialog-content">
          <div className="app-logo">
            <span className="logo-ctrl">Ctrl</span>
            <span className="logo-sketch">Sketch</span>
            <span className="logo-pro">Pro</span>
          </div>
          
          <div className="app-info">
            <p className="version">Version {version}</p>
            <p className="copyright">© 2023-2024 CtrlSketchPro Team. All rights reserved.</p>
          </div>
          
          <div className="license-section">
            <h3>License Information</h3>
            {licenseInfo ? (
              <div className="license-summary">
                <p>
                  <strong>Type:</strong> {formatLicenseType(licenseInfo.type)} Edition
                </p>
                <p>
                  <strong>Status:</strong> {licenseInfo.status.charAt(0).toUpperCase() + licenseInfo.status.slice(1)}
                </p>
                {licenseInfo.expiryDate && (
                  <p>
                    <strong>Expires:</strong> {new Date(licenseInfo.expiryDate).toLocaleDateString()}
                  </p>
                )}
                {licenseInfo.remainingDays !== undefined && licenseInfo.status === 'trial' && (
                  <p className="trial-days">
                    <strong>Trial Days Remaining:</strong> {licenseInfo.remainingDays}
                  </p>
                )}
                <button 
                  onClick={onManageLicense} 
                  className="manage-license-button"
                >
                  Manage License
                </button>
              </div>
            ) : (
              <p>Loading license information...</p>
            )}
          </div>
          
          <div className="about-description">
            <p>
              CtrlSketchPro is a powerful digital drawing application designed specifically for 
              creating control system diagrams, HVAC layouts, and building automation schematics.
            </p>
            <p>
              With multi-page support, advanced drawing tools, and specialized components for 
              control systems, CtrlSketchPro helps professionals create detailed technical 
              documentation quickly and efficiently.
            </p>
          </div>
          
          <div className="links-section">
            <a href="https://ctrlsketchpro.com" target="_blank" rel="noopener noreferrer">Website</a>
            <a href="https://ctrlsketchpro.com/docs" target="_blank" rel="noopener noreferrer">Documentation</a>
            <a href="https://ctrlsketchpro.com/support" target="_blank" rel="noopener noreferrer">Support</a>
          </div>
        </div>
        
        <div className="dialog-footer">
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;