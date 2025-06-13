    handleClick(e) {
      this.$refs.canvas.focus();
      if (this.isDragging || this.isResizing || this.isRotating || this.isDrawing || this.debugInfo.isDragging) {
        return;
      }
      
      // Handle connection point tool - single click just shows a reminder
      if (this.tool === 'connection-point') {
        // Only show the notification occasionally to avoid spamming
        const now = Date.now();
        if (!window._lastConnectionPointClickReminder || 
            (now - window._lastConnectionPointClickReminder > 5000)) {
          console.log('CONNECTION POINT TOOL - SHOWING DOUBLE-CLICK REMINDER');
          this.$emit('show-notification', {
            type: 'info',
            message: 'Double-click to create a connection point'
          });
          window._lastConnectionPointClickReminder = now;
        }
        return;
      }
      
      // Handle other tools
      console.log('CONNECTION POINT CLICK HANDLER ACTIVATED');
      console.log('CURRENT SHAPES COUNT:', this.shapes.length);
      
      // Check if we just blocked a mousedown event
      const now = Date.now();
      if (window._connectionPointMousedownBlocked && 
          (now - window._connectionPointMousedownBlocked < 300)) {
        console.log('CLICK IMMEDIATELY AFTER BLOCKED MOUSEDOWN - IGNORING');
        return;
      }
      
      // Count existing connection points
      const connectionPointsCount = this.shapes.filter(s => s.type === 'connection-point').length;
      console.log('EXISTING CONNECTION POINTS:', connectionPointsCount);
      
      // Use a much longer delay to prevent multiple points (3 seconds)
      if (window._lastConnectionPointTime && (now - window._lastConnectionPointTime < 3000)) {
        console.log('CONNECTION POINT CREATION BLOCKED - TOO SOON');
        console.log('Time since last point:', now - window._lastConnectionPointTime, 'ms');
        
        // Show a notification to the user
        this.$emit('show-notification', {
          type: 'warning',
          message: 'Please wait before adding another connection point'
        });
        
        return;
      }
      
      // Set the global timestamp to prevent rapid creation
      window._lastConnectionPointTime = now;
      console.log('CONNECTION POINT TIMESTAMP SET:', now);
      
      // Also set a flag to indicate we're creating a connection point
      // This will help prevent any duplicate creation
      window._isCreatingConnectionPoint = true;
      
      // Clear the flag after a delay
      setTimeout(() => {
        window._isCreatingConnectionPoint = false;
        console.log('CONNECTION POINT CREATION FLAG CLEARED');
      }, 1000);
      
      // Get coordinates
      const rect = this.$refs.canvas.getBoundingClientRect();
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      
      // Snap coordinates
      const snappedPoint = this.snapCoordinate(x, y, false);
      const snappedX = snappedPoint.x;
      const snappedY = snappedPoint.y;
      
      // Check if there's already a connection point nearby (within 20 pixels)
      const minDistance = 20;
      const existingConnectionPoints = this.shapes.filter(s => s.type === 'connection-point');
      const nearbyPoint = existingConnectionPoints.find(cp => {
        const distance = Math.sqrt((cp.x - snappedX) ** 2 + (cp.y - snappedY) ** 2);
        return distance < minDistance;
      });
      
      if (nearbyPoint) {
        this.$emit('show-notification', {
          type: 'warning',
          message: 'Connection point already exists nearby'
        });
        return;
      }
      
      // First check if we clicked on an existing shape (but not a connection point)
      const shape = this.getShapeAt(x, y, true); // Pass true to exclude connection points
      
      // Create a unique ID with timestamp and random number to ensure uniqueness
      const uniqueId = `connection-point-${now}-${Math.floor(Math.random() * 1000000)}`;
      console.log('CREATING CONNECTION POINT WITH ID:', uniqueId);
      
      // Create the connection point object
      const connectionPoint = {
        id: uniqueId,
        type: 'connection-point',
        x: snappedX,
        y: snappedY,
        width: 10,  // Small size for hit testing
        height: 10,
        visible: true,       // For editing
        printable: false,    // Not visible when printing
        color: '#FF6600',    // Orange color for visibility
        layerId: this.activeLayer ? this.activeLayer.id : undefined,
        createdAt: now       // Add timestamp for debugging
      };
      
      console.log('CONNECTION POINT OBJECT CREATED:', connectionPoint);
      
      // CRITICAL: Check if we already have this connection point (by coordinates)
      // This is a final safety check to prevent duplicate points
      const isDuplicate = this.shapes.some(s => 
        s.type === 'connection-point' && 
        Math.abs(s.x - snappedX) < 5 && 
        Math.abs(s.y - snappedY) < 5
      );
      
      if (isDuplicate) {
        console.log('DUPLICATE CONNECTION POINT DETECTED - BLOCKING CREATION');
        this.$emit('show-notification', {
          type: 'warning',
          message: 'Connection point already exists at this location'
        });
        return;
      }
      
      // If we clicked on a shape, attach the connection point to it
      if (shape && shape.type !== 'connection-point') {
        console.log('ATTACHING CONNECTION POINT TO SHAPE:', shape.id);
        connectionPoint.parentId = shape.id;  // Store the parent shape ID
        
        // Create a new array instead of modifying the existing one
        const updatedShapes = [...this.shapes, connectionPoint];
        console.log('SHAPES COUNT BEFORE EMIT:', this.shapes.length);
        console.log('SHAPES COUNT AFTER ADDING POINT:', updatedShapes.length);
        
        this.$emit('shape-added', updatedShapes);
        console.log('SHAPE-ADDED EVENT EMITTED');
        
        // Show notification
        this.$emit('show-notification', {
          type: 'success',
          message: 'Connection point added to shape'
        });
      } else {
        console.log('CREATING STANDALONE CONNECTION POINT');
        // Create a new array instead of modifying the existing one
        const updatedShapes = [...this.shapes, connectionPoint];
        console.log('SHAPES COUNT BEFORE EMIT:', this.shapes.length);
        console.log('SHAPES COUNT AFTER ADDING POINT:', updatedShapes.length);
        
        this.$emit('shape-added', updatedShapes);
        console.log('SHAPE-ADDED EVENT EMITTED');
        
        // Show notification
        this.$emit('show-notification', {
          type: 'success',
          message: 'Connection point added'
        });
      }
      
      // Force a render to update the canvas
      this.render();
      return;
      
      // Check if we're clicking on the debug overlay
      if (this.showDebugOverlay) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Hit test against debug overlay
        const hit = this.hitTestDebugOverlay(canvasX, canvasY);
        if (hit) {
          console.log('Debug overlay clicked:', hit);
          return;
        }
      }
      
      // If we're in select mode, check if we clicked on a shape
      if (this.tool === 'select' || this.tool === '') {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
        const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
        const x = (e.clientX - rect.left - centerX) / this.zoom;
        const y = (e.clientY - rect.top - centerY) / this.zoom;
        
        // Check if we clicked on a shape
        const shape = this.getShapeAt(x, y);
        
        if (shape) {
          console.log('Clicked on shape:', shape.id, shape.type);
          
          // If shift is pressed, toggle selection
          if (e.shiftKey) {
            const isSelected = this.localSelectedShapes.some(s => s.id === shape.id);
            
            if (isSelected) {
              // Remove from selection
              const newSelection = this.localSelectedShapes.filter(s => s.id !== shape.id);
              this.$emit('shapes-selected', newSelection);
            } else {
              // Add to selection
              const newSelection = [...this.localSelectedShapes, shape];
              this.$emit('shapes-selected', newSelection);
            }
          } else {
            // Select only this shape
            this.$emit('shapes-selected', [shape]);
          }
        } else {
          // If we didn't click on a shape and shift is not pressed, clear selection
          if (!e.shiftKey && this.localSelectedShapes.length > 0) {
            this.$emit('shapes-selected', []);
          }
        }
      }
    },