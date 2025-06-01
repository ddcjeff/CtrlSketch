import React, { useState, useEffect } from 'react';
import { PART_TYPES, INSTALLATION_STATUS, getDefaultDescription } from '../types/part-types';
import './PartPropertiesPanel.css';

/**
 * Panel for editing part properties
 * @param {Object} props - Component props
 * @param {Object} props.part - Part object to edit
 * @param {Function} props.onUpdate - Callback function when part is updated
 * @param {Function} props.onClose - Callback function when panel is closed
 * @returns {JSX.Element} Rendered component
 */
const PartPropertiesPanel = ({ part, onUpdate, onClose }) => {
  const [partData, setPartData] = useState({ ...part });
  
  // Update local state when part changes
  useEffect(() => {
    setPartData({ ...part });
  }, [part]);
  
  // Handle field changes
  const handleChange = (e) => {
    console.log("Field change detected:", e.target.name, e.target.value);
    const { name, value } = e.target;
    
    // List of fields that should be treated as integers
    const integerFields = ['quantity', 'strokeWidth'];
    
    // List of fields that should be treated as floats
    const floatFields = ['x', 'y', 'width', 'height', 'radius', 'rotation'];
    
    // Handle points field specially
    if (name === 'points' && partData.points) {
      try {
        // Parse the space-separated points
        const pointsArray = value.split(' ').map(point => {
          const [x, y] = point.split(',').map(coord => parseFloat(coord));
          return { x, y };
        });
        
        setPartData({
          ...partData,
          points: pointsArray
        });
      } catch (error) {
        // If parsing fails, just store the raw string
        setPartData({
          ...partData,
          points: value
        });
      }
    }
    // Handle integer fields
    else if (integerFields.includes(name)) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1) return;
      
      setPartData({
        ...partData,
        [name]: numValue
      });
    }
    // Handle float fields
    else if (floatFields.includes(name)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
      
      setPartData({
        ...partData,
        [name]: numValue
      });
    }
    // Handle all other fields as strings
    else {
      setPartData({
        ...partData,
        [name]: value
      });
    }
  };
  
  // Handle part type change and update description if it's using the default
  const handlePartTypeChange = (e) => {
    const newPartType = e.target.value;
    const isUsingDefaultDescription = 
      partData.description === getDefaultDescription(partData.partType) || 
      !partData.description;
    
    setPartData({
      ...partData,
      partType: newPartType,
      description: isUsingDefaultDescription ? getDefaultDescription(newPartType) : partData.description
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", partData);
    
    // Update with timestamp
    const updatedPart = {
      ...partData,
      lastModified: new Date().toISOString()
    };
    
    console.log("Calling onUpdate with:", updatedPart);
    onUpdate(updatedPart);
  };
  
  return (
    <div className="part-properties-panel">
      <div className="panel-header">
        <h3>Part Properties</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="part-form">
        <div className="form-group">
          <label htmlFor="tag">Tag</label>
          <input
            type="text"
            id="tag"
            name="tag"
            value={partData.tag || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="partType">Type</label>
          <select
            id="partType"
            name="partType"
            value={partData.partType || ''}
            onChange={handlePartTypeChange}
          >
            {Object.values(PART_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="partNumber">Part Number</label>
          <input
            type="text"
            id="partNumber"
            name="partNumber"
            value={partData.partNumber || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="config">Configuration</label>
          <input
            type="text"
            id="config"
            name="config"
            value={partData.config || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={partData.quantity || 1}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="manufacturer">Manufacturer</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={partData.manufacturer || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={partData.description || ''}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="installationStatus">Installation Status</label>
          <select
            id="installationStatus"
            name="installationStatus"
            value={partData.installationStatus || INSTALLATION_STATUS.NOT_STARTED}
            onChange={handleChange}
          >
            {Object.values(INSTALLATION_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="installationNotes">Installation Notes</label>
          <textarea
            id="installationNotes"
            name="installationNotes"
            value={partData.installationNotes || ''}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Visual Properties</label>
          <div className="visual-properties">
            <div className="color-picker">
              <label htmlFor="fillColor">Fill Color</label>
              <input
                type="color"
                id="fillColor"
                name="fillColor"
                value={partData.fillColor || '#e6f7ff'}
                onChange={handleChange}
              />
            </div>
            
            <div className="color-picker">
              <label htmlFor="strokeColor">Stroke Color</label>
              <input
                type="color"
                id="strokeColor"
                name="strokeColor"
                value={partData.strokeColor || '#000000'}
                onChange={handleChange}
              />
            </div>
            
            <div className="stroke-width">
              <label htmlFor="strokeWidth">Stroke Width</label>
              <input
                type="range"
                id="strokeWidth"
                name="strokeWidth"
                min="1"
                max="10"
                value={partData.strokeWidth || 2}
                onChange={handleChange}
              />
              <span>{partData.strokeWidth || 2}px</span>
            </div>
            
            {/* Shape-specific properties */}
            {partData.type && (
              <div className="shape-properties">
                <h4>Shape Properties</h4>
                
                {/* Position properties */}
                <div className="position-properties">
                  <div className="form-group">
                    <label htmlFor="x">X Position</label>
                    <input
                      type="number"
                      id="x"
                      name="x"
                      value={partData.x || 0}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="y">Y Position</label>
                    <input
                      type="number"
                      id="y"
                      name="y"
                      value={partData.y || 0}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Size properties */}
                {(partData.width !== undefined || partData.height !== undefined) && (
                  <div className="size-properties">
                    {partData.width !== undefined && (
                      <div className="form-group">
                        <label htmlFor="width">Width</label>
                        <input
                          type="number"
                          id="width"
                          name="width"
                          min="1"
                          value={partData.width || 0}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                    
                    {partData.height !== undefined && (
                      <div className="form-group">
                        <label htmlFor="height">Height</label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          min="1"
                          value={partData.height || 0}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Radius for circles */}
                {partData.radius !== undefined && (
                  <div className="form-group">
                    <label htmlFor="radius">Radius</label>
                    <input
                      type="number"
                      id="radius"
                      name="radius"
                      min="1"
                      value={partData.radius || 0}
                      onChange={handleChange}
                    />
                  </div>
                )}
                
                {/* Points for polygons and paths */}
                {partData.points && (
                  <div className="form-group">
                    <label htmlFor="points">Points</label>
                    <textarea
                      id="points"
                      name="points"
                      value={Array.isArray(partData.points) ? partData.points.map(p => `${p.x},${p.y}`).join(' ') : partData.points}
                      onChange={handleChange}
                      rows="3"
                    />
                    <small>Format: x1,y1 x2,y2 x3,y3 ...</small>
                  </div>
                )}
                
                {/* Rotation */}
                <div className="form-group">
                  <label htmlFor="rotation">Rotation (degrees)</label>
                  <input
                    type="number"
                    id="rotation"
                    name="rotation"
                    value={partData.rotation || 0}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default PartPropertiesPanel;