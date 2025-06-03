# CtrlSketch Pro Design Conversation

This document captures the key elements of our design conversation for CtrlSketch Pro, our cutting-edge digital sketching and design platform for HVAC/controls engineers.

## Project Overview

CtrlSketch Pro is a web-based design tool for creating technical diagrams and schematics, with a focus on HVAC controls and building automation. It aims to replace existing MS Access and Visio-based solutions with a modern, cloud-based approach.

## Key Features Discussed

### 1. Website and Deployment

- Created deployment packages for GoDaddy cPanel hosting
- Fixed website path references for consistent rendering
- Prepared deployment instructions with proper file permissions
- Developed social media graphics and email templates

### 2. Enhanced Engineering Calculations

The engineering calculations module includes specialized tools for HVAC professionals:

- **Valve Selection & Sizing**: Flow coefficient determination, valve authority calculations
- **Air Flow Station Sizing**: Sensor quantity calculator, accuracy prediction
- **DP Sensor Selection**: Sensor range calculation, pressure drop information
- **Controller Input Calculator**: Scaling for controller inputs, resolution calculations
- **Steam Valve Sizing**: Critical flow factors, steam-specific calculations
- **Niagara Integration**: Tools for Niagara BMS integration, history calculations
- **Schedule Builders**: Room, valve, air flow, and damper schedule generators
- **Actuator Sizing**: Torque calculations for valves and dampers
- **Air Flow Calculations**: Duct sizing, static pressure, terminal box calculations

### 3. Node Batch Creation

A tool for adding multiple device nodes to a riser diagram with options for:
- Automatic numbering with a starting address
- Network and zone assignment
- Device type selection
- Layout options (horizontal, vertical, grid)
- Spacing control and preview

### 4. Project Estimation

A comprehensive project cost estimator based on the existing VB code:

- **Component-based Costing**: Material costs and labor factors per component
- **Labor Categories**:
  - Control Drawings
  - Graphics
  - Programming
  - Startup
  - Installation
  - Flex
  - Conduit
  - Wire

- **Labor Factor Adjustment**: Dialog for modifying labor multipliers
- **Reporting**: Multiple views including summary, component detail, and labor breakdown
- **Export Capabilities**: For proposals and project management

## Implementation Progress

Components developed so far:

1. **AddMultipleNodesDialog.tsx**: Modern React implementation of the device node batch creator
2. **nodeCreationHelpers.ts**: Utilities for positioning and configuring device nodes
3. **EstimatorFactors.tsx**: Dialog for adjusting labor estimation factors
4. **estimationEngine.ts**: Core calculation engine for project estimates
5. **EstimationPanel.tsx**: UI panel for viewing and interacting with estimates

## Future Directions

Planned features and enhancements:

1. Further HVAC-specific calculation tools
2. Enhanced BOM generation
3. Component-based estimation tied to diagram elements
4. Multi-user collaboration features
5. Web-to-PDF export for documentation
6. Tablet support for field use

## Technical Stack

- React with TypeScript
- Tailwind CSS with ShadCN UI components
- PostgreSQL database (Supabase)
- Express backend
- Stripe for subscription billing