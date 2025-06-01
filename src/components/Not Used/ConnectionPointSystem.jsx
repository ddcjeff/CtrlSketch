import React from 'react';
import { CONNECTION_POINT_TYPES } from '../types/drawing-types';

/**
 * Calculates the position of a connection point on an element
 * @param {Object} element - The element to calculate connection point for
 * @param {Object} point - The connection point with relative position
 * @returns {Object} Absolute position {x, y} of the connection point
 */
export const calculateConnectionPointPosition = (element, point) => {
  const { x1, y1, x2, y2 } = element;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);

  return {
    x: left + width * point.relativeX,
    y: top + height * point.relativeY
  };
};

/**
 * Generates default connection points for an element based on its type
 * @param {Object} element - The element to generate connection points for
 * @returns {Array} Array of connection points for the element
 */
export const generateDefaultConnectionPoints = (element) => {
  const { type } = element;

  // Default connection points based on element type
  switch (type) {
    case 'rectangle':
    case 'part':
      // Create connection points in the middle of each side
      return [
        { id: `${element.id}_top`, elementId: element.id, relativeX: 0.5, relativeY: 0, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_right`, elementId: element.id, relativeX: 1, relativeY: 0.5, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_bottom`, elementId: element.id, relativeX: 0.5, relativeY: 1, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_left`, elementId: element.id, relativeX: 0, relativeY: 0.5, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL }
      ];
    
    case 'ellipse':
      // Create connection points at cardinal positions (N, E, S, W)
      return [
        { id: `${element.id}_top`, elementId: element.id, relativeX: 0.5, relativeY: 0, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_right`, elementId: element.id, relativeX: 1, relativeY: 0.5, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_bottom`, elementId: element.id, relativeX: 0.5, relativeY: 1, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL },
        { id: `${element.id}_left`, elementId: element.id, relativeX: 0, relativeY: 0.5, type: CONNECTION_POINT_TYPES.BIDIRECTIONAL }
      ];
    
    case 'line':
    case 'arrow':
      // Create connection points at the start and end of the line
      return [
        { id: `${element.id}_start`, elementId: element.id, relativeX: 0, relativeY: 0, type: CONNECTION_POINT_TYPES.OUTPUT },
        { id: `${element.id}_end`, elementId: element.id, relativeX: 1, relativeY: 1, type: CONNECTION_POINT_TYPES.INPUT }
      ];
      
    default:
      return [];
  }
};

/**
 * Finds the nearest connection point to a given position
 * @param {Array} connectionPoints - Array of all connection points
 * @param {number} x - X coordinate to check
 * @param {number} y - Y coordinate to check
 * @param {number} threshold - Distance threshold for considering a point nearby
 * @returns {Object|null} Nearest connection point or null if none within threshold
 */
export const findNearestConnectionPoint = (connectionPoints, x, y, threshold = 15) => {
  let nearestPoint = null;
  let minDistance = threshold;

  connectionPoints.forEach(point => {
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  });

  return nearestPoint;
};

/**
 * Creates a connection between two connection points
 * @param {Object} sourcePoint - Source connection point
 * @param {Object} targetPoint - Target connection point
 * @param {string} connectionId - Unique ID for the new connection
 * @returns {Object} New connection object
 */
export const createConnection = (sourcePoint, targetPoint, connectionId) => {
  return {
    id: connectionId,
    type: 'connection',
    sourcePointId: sourcePoint.id,
    targetPointId: targetPoint.id,
    sourceElementId: sourcePoint.elementId,
    targetElementId: targetPoint.elementId,
    strokeColor: '#4F81BD',
    strokeWidth: 2,
    lineStyle: 'solid',
    x1: sourcePoint.x,
    y1: sourcePoint.y,
    x2: targetPoint.x,
    y2: targetPoint.y,
    arrowStyle: 'simple',
    rotation: 0
  };
};

/**
 * Updates a connection's coordinates based on the positions of its endpoints
 * @param {Object} connection - The connection to update
 * @param {Array} connectionPoints - Array of all connection points
 * @returns {Object} Updated connection with new coordinates
 */
export const updateConnectionCoordinates = (connection, connectionPoints) => {
  const sourcePoint = connectionPoints.find(point => point.id === connection.sourcePointId);
  const targetPoint = connectionPoints.find(point => point.id === connection.targetPointId);
  
  if (!sourcePoint || !targetPoint) return connection;
  
  return {
    ...connection,
    x1: sourcePoint.x,
    y1: sourcePoint.y,
    x2: targetPoint.x,
    y2: targetPoint.y
  };
};

/**
 * Checks if a connection between two points is valid based on their types
 * @param {Object} sourcePoint - Source connection point
 * @param {Object} targetPoint - Target connection point
 * @returns {boolean} True if connection is valid, false otherwise
 */
export const isValidConnection = (sourcePoint, targetPoint) => {
  // Don't connect a point to itself or points on the same element
  if (sourcePoint.id === targetPoint.id || 
      sourcePoint.elementId === targetPoint.elementId) {
    return false;
  }

  // Check compatibility based on connection point types
  switch (sourcePoint.type) {
    case CONNECTION_POINT_TYPES.OUTPUT:
      return targetPoint.type === CONNECTION_POINT_TYPES.INPUT || 
             targetPoint.type === CONNECTION_POINT_TYPES.BIDIRECTIONAL;
    
    case CONNECTION_POINT_TYPES.INPUT:
      return targetPoint.type === CONNECTION_POINT_TYPES.OUTPUT || 
             targetPoint.type === CONNECTION_POINT_TYPES.BIDIRECTIONAL;
    
    case CONNECTION_POINT_TYPES.BIDIRECTIONAL:
      return true;
    
    default:
      return false;
  }
};

/**
 * React component to render a connection point
 */
export const ConnectionPoint = ({ point, isSelected, onClick }) => {
  // Determine color based on connection point type
  let color;
  switch (point.type) {
    case CONNECTION_POINT_TYPES.INPUT:
      color = '#E84C88'; // Pink
      break;
    case CONNECTION_POINT_TYPES.OUTPUT:
      color = '#F7A41D'; // Orange/gold
      break;
    case CONNECTION_POINT_TYPES.BIDIRECTIONAL:
      color = '#4F81BD'; // Blue
      break;
    default:
      color = '#999999'; // Gray
  }

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={isSelected ? 7 : 5}
      fill={isSelected ? '#ffffff' : color}
      stroke={color}
      strokeWidth={2}
      onClick={onClick ? (e) => {
        e.stopPropagation();
        onClick(point);
      } : undefined}
      style={{ cursor: 'pointer' }}
    />
  );
};

/**
 * React component to render a connection between two points
 */
export const Connection = ({ connection, isSelected, onClick }) => {
  const { x1, y1, x2, y2, strokeColor, strokeWidth, lineStyle, arrowStyle } = connection;
  
  // Determine the stroke-dasharray based on line style
  let dashArray;
  switch (lineStyle) {
    case 'dashed':
      dashArray = '10,5';
      break;
    case 'dotted':
      dashArray = '2,4';
      break;
    default:
      dashArray = 'none';
  }

  // Calculate the arrow marker for the end of the line
  const renderArrowMarker = () => {
    if (arrowStyle === 'none') return null;
    
    const id = `arrow-${connection.id}`;
    
    switch (arrowStyle) {
      case 'simple':
        return (
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        );
      
      case 'triangle':
        return (
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="none" stroke={strokeColor} strokeWidth="1" />
          </marker>
        );
      
      case 'filled-triangle':
        return (
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        );
      
      case 'diamond':
        return (
          <marker
            id={id}
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill={strokeColor} />
          </marker>
        );
      
      case 'circle':
        return (
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <circle cx="5" cy="5" r="4" fill={strokeColor} />
          </marker>
        );
      
      default:
        return null;
    }
  };

  return (
    <g onClick={onClick}>
      <defs>
        {renderArrowMarker()}
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isSelected ? '#ff5500' : strokeColor}
        strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
        strokeDasharray={dashArray}
        markerEnd={arrowStyle !== 'none' ? `url(#arrow-${connection.id})` : ''}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
};

/**
 * Calculates and updates all connection points for a page's elements
 * @param {Array} elements - Array of elements on the page
 * @returns {Array} Updated array of connection points
 */
export const updateAllConnectionPoints = (elements) => {
  let connectionPoints = [];

  elements.forEach(element => {
    // Skip connection elements as they don't have connection points
    if (element.type === 'connection') return;
    
    // Generate default points if none exist for this element
    const elementPoints = element.connectionPoints || generateDefaultConnectionPoints(element);
    
    // Calculate absolute positions for all connection points
    const updatedPoints = elementPoints.map(point => {
      const pos = calculateConnectionPointPosition(element, point);
      return { ...point, x: pos.x, y: pos.y };
    });
    
    connectionPoints = [...connectionPoints, ...updatedPoints];
  });

  return connectionPoints;
};

/**
 * Updates all connections based on the new positions of connection points
 * @param {Array} connections - Array of all connections
 * @param {Array} connectionPoints - Array of all connection points
 * @returns {Array} Updated array of connections
 */
export const updateAllConnections = (connections, connectionPoints) => {
  if (!connections || !connectionPoints) return [];
  
  return connections.map(connection => 
    updateConnectionCoordinates(connection, connectionPoints)
  );
};