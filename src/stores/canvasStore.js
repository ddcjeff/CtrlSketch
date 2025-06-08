import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { DOMParser } from 'xmldom';

export const useCanvasStore = defineStore('canvas', () => {
  // State
  const shapes = ref([]); // Array of shapes for the active page
  const selectedShapes = ref([]); // Array of selected shape IDs
  const layers = ref([
    { id: 'layer-0', name: 'Layer 1', visible: true, frozen: false, opacity: 100, shapes: [] },
  ]); // Array of layers
  const activeLayerId = ref('layer-0'); // ID of the active layer
  const pages = ref([
    {
      id: 'page-1',
      name: 'Page 1',
      type: 'foreground',
      backgroundPageId: '',
      description: 'Default page',
      drawingType: 'default',
      shapes: [],
    },
    {
      id: 'page-bg-1',
      name: 'Background',
      type: 'background',
      backgroundPageId: '',
      description: 'Default background page',
      drawingType: 'default',
      shapes: [],
    },
  ]); // Array of pages
  const activePageId = ref('page-1'); // ID of the active page
  const currentTool = ref('select'); // Current drawing tool
  const currentStyles = ref({
    lineWidth: 2,
    stroke: '#000000',
    fill: '#000000',
    lineStyle: 'solid',
  }); // Current drawing styles
  const textStyles = ref({
    lineWidth: 1,
    stroke: '#000000',
    fill: '#000000',
    lineStyle: 'solid',
  }); // Text-specific styles
  const gridSize = ref(20); // Grid size in pixels
  const gridOpacity = ref(0.5); // Grid opacity (0 to 1)
  const gridType = ref('square'); // Grid type: 'square', 'isometric', 'perspective', 'radial'
  const gridColor = ref('#000000'); // Grid color
  const showRulers = ref(false); // Toggle rulers visibility
  const snapToGrid = ref(false); // Toggle snap-to-grid
  const showLayers = ref(false); // Toggle layers panel visibility
  const showShapeLibrary = ref(false); // Toggle shape library visibility
  const shapeLibraryPosition = ref({ x: 12, y: 12 }); // Shape library panel position
  const isDraggingShapeLibrary = ref(false); // Shape library dragging state
  const dragOffsetShapeLibrary = ref({ x: 0, y: 0 }); // Shape library drag offset
  const showPageTabs = ref(false); // Toggle page tabs visibility
  const pageTabsPosition = ref({ x: 0, y: 0 }); // Page tabs panel position
  const isDraggingPageTabs = ref(false); // Page tabs dragging state
  const dragOffsetPageTabs = ref({ x: 0, y: 0 }); // Page tabs drag offset
  const contextMenuPage = ref(null); // Page for context menu
  const contextMenuPosition = ref({ x: 0, y: 0 }); // Context menu position
  const showRenameDialog = ref(false); // Toggle rename dialog
  const renameData = ref({ id: '', name: '' }); // Rename dialog data
  const showAddPageDialog = ref(false); // Toggle add page dialog
  const showPageManagerDialog = ref(false); // Toggle page manager dialog
  const showCalculator = ref(false); // Toggle calculator
  const calculatorPosition = ref({ x: 400, y: 200 }); // Calculator position
  const showColorPicker = ref(false); // Toggle color picker
  const colorPickerPosition = ref({ x: 400, y: 200 }); // Color picker position
  const showPartPropertiesDialog = ref(false); // Toggle part properties dialog
  const partPropertiesData = ref({
    name: '',
    haystackTag: '',
    partNumber: '',
    quantity: 1,
    description: '',
    pointType: '',
    pdfPath: '',
  }); // Part properties data
  const pendingShapeData = ref(null); // Pending shape data for library
  const draggedShapeData = ref(null); // Dragged shape data
  const showBOMGenerator = ref(false); // Toggle BOM generator
  const bomGeneratorPosition = ref({ x: 200, y: 100 }); // BOM generator position
  const showKeyboardShortcuts = ref(false); // Toggle keyboard shortcuts panel
  const history = ref([]); // Array of history states
  const historyIndex = ref(-1); // Current position in history
  const autoSaveEnabled = ref(true); // Auto-save toggle
  const autoSaveInterval = ref(60000); // Auto-save interval (1 minute)
  const autoSaveTimer = ref(null); // Auto-save timer
  const lastAutoSave = ref(null); // Last auto-save timestamp
  const autoSaveStatus = ref(null); // 'saving', 'saved', 'error'
  const autoSaveMessage = ref(''); // Auto-save message
  const localStorageKey = ref('ctrlsketch_autosave_'); // LocalStorage key prefix
  const documentName = ref('Untitled'); // Document name
  const documentModified = ref(false); // Document modified flag
  const showSplashScreen = ref(true); // Toggle splash screen
  const appVersion = ref('1.0.0'); // Application version
  const licenseNumber = ref('CS-2023-0001'); // License number
  const clipboard = ref([]); // Clipboard for cut/copy/paste
  const activeTab = ref('Insert'); // Active ribbon tab
  const isGlossy = ref(false); // Glossy UI toggle
  const shapeLibraries = ref([
    { id: 'default', name: 'Default Library' },
    { id: 'hvac', name: 'HVAC Components' },
    { id: 'electrical', name: 'Electrical Symbols' },
  ]); // Shape libraries
  const libraryShapes = ref([]); // Shapes in the shape library

  // Computed Properties
  const activePage = computed(() =>
    pages.value.find((page) => page.id === activePageId.value) || pages.value[0]
  );
  const activeLayer = computed(() =>
    layers.value.find((layer) => layer.id === activeLayerId.value) || layers.value[0]
  );
  const selectedLayerIndex = computed(() =>
    layers.value.findIndex((layer) => layer.id === activeLayerId.value)
  );
  const visibleLayers = computed(() => {
    const result = layers.value
      .filter((layer) => layer.visible)
      .map((layer) => ({
        id: layer.id,
        name: layer.name,
        visible: true,
        opacity: layer.opacity || 100,
      }));
    console.log('Computed visibleLayers:', result);
    return result;
  });
  const selectedShapesObjects = computed(() =>
    shapes.value.filter((shape) => selectedShapes.value.includes(shape.id))
  );
  const canvasWidth = computed(() => 1632); // Fixed canvas width
  const canvasHeight = computed(() => 1056); // Fixed canvas height
  const visibleShapes = computed(() => {
    // First ensure shapes array is up-to-date with all shapes from all layers
    if (shapes.value.length === 0 && layers.value.some(layer => layer.shapes && layer.shapes.length > 0)) {
      shapes.value = getAllShapes();
    }
    
    console.log('Computing visibleShapes from shapes:', shapes.value.length);
    
    // If we have shapes but no visible layers, make all layers visible
    if (shapes.value.length > 0 && !layers.value.some(layer => layer.visible)) {
      console.log('No visible layers but shapes exist - making all layers visible');
      layers.value = layers.value.map(layer => ({
        ...layer,
        visible: true
      }));
    }
    
    const visibleLayerIds = visibleLayers.value.map(layer => layer.id);
    console.log('Visible layer IDs:', visibleLayerIds);
    
    // Fix shapes with missing or invalid layerIds
    let shapesNeedingFix = false;
    
    // Process shapes to fix any layerId issues
    const processedShapes = shapes.value.map(shape => {
      // Create a new shape object to avoid modifying the original
      const newShape = { ...shape };
      
      // If shape has no layerId, assign it to the active layer
      if (newShape.layerId === undefined || newShape.layerId === null) {
        console.warn(`Shape ${newShape.id} has no layerId, assigning to active layer`);
        newShape.layerId = activeLayerId.value;
        shapesNeedingFix = true;
      } 
      // If shape has an invalid layerId (not in any layer), assign it to the active layer
      else if (!layers.value.some(layer => layer.id === newShape.layerId)) {
        console.warn(`Shape ${newShape.id} has invalid layerId ${newShape.layerId}, assigning to active layer`);
        newShape.layerId = activeLayerId.value;
        shapesNeedingFix = true;
      }
      
      return newShape;
    });
    
    // If we fixed any shapes, update the shapes array
    if (shapesNeedingFix) {
      console.log('Updating shapes with fixed layerIds');
      shapes.value = processedShapes;
    }
    
    // Now filter for visibility
    const result = processedShapes
      .filter(shape => {
        const isVisible = visibleLayerIds.includes(shape.layerId);
        if (!isVisible) {
          console.log('Filtering out shape due to invisible layer:', shape);
        }
        return isVisible;
      })
      .map(shape => {
        const shapeCopy = { ...shape };
        const layer = visibleLayers.value.find(l => l.id === shapeCopy.layerId);
        if (layer && layer.opacity < 100) {
          shapeCopy._layerOpacity = layer.opacity / 100;
        }
        return shapeCopy;
      });
    
    console.log('Computed visibleShapes:', result.length);
    
    // If we have shapes but none are visible, make the active layer visible
    if (shapes.value.length > 0 && result.length === 0) {
      console.log('No visible shapes but shapes exist - making active layer visible');
      const activeLayerIndex = layers.value.findIndex(l => l.id === activeLayerId.value);
      if (activeLayerIndex >= 0) {
        layers.value[activeLayerIndex].visible = true;
        // This will trigger a recomputation of visibleShapes
      }
    }
    
    return result;
  });

  // Actions
  function initializeApp() {
    initializeGlossyPreference();
    initializeDefaultPage();
    
    // Ensure the default layer exists
    if (layers.value.length === 0) {
      console.log('No layers found, creating default layer');
      layers.value = [
        { id: 'layer-0', name: 'Layer 1', visible: true, frozen: false, opacity: 100, shapes: [] }
      ];
      activeLayerId.value = 'layer-0';
    }
    
    // Ensure shapes array is populated from layers
    shapes.value = getAllShapes();
    
    console.log('After initialization:');
    console.log('- Layers:', layers.value);
    console.log('- Active layer ID:', activeLayerId.value);
    console.log('- Shapes:', shapes.value);
    
    history.value = [JSON.stringify(shapes.value)];
    historyIndex.value = 0;
    setTimeout(() => {
      autoSaveEnabled.value = true;
      initAutoSave();
    }, 2000);
  }

  function initializeGlossyPreference() {
    try {
      const savedPreference = localStorage.getItem('glossyUI');
      if (savedPreference === 'true') {
        isGlossy.value = true;
        applyGlossyEffect();
      }
    } catch (error) {
      console.error('Error initializing glossy preference:', error);
    }
  }

  function toggleGlossy() {
    isGlossy.value = !isGlossy.value;
    localStorage.setItem('glossyUI', isGlossy.value);
    if (isGlossy.value) {
      applyGlossyEffect();
    } else {
      removeGlossyEffect();
    }
  }

  function applyGlossyEffect() {
    try {
      const menuBar = document.querySelector('[data-glossy-target="menubar"]');
      const menuButtons = document.querySelector('[data-glossy-target="menu-buttons"]');
      const ribbon = document.querySelector('[data-glossy-target="ribbon"]');
      if (menuBar) menuBar.classList.add('glossy-menubar');
      if (menuButtons) menuButtons.classList.add('glossy-buttons', 'glossy-tabs');
      if (ribbon) ribbon.classList.add('glossy-ribbon');
    } catch (error) {
      console.error('Error applying glossy effect:', error);
    }
  }

  function removeGlossyEffect() {
    try {
      const menuBar = document.querySelector('[data-glossy-target="menubar"]');
      const menuButtons = document.querySelector('[data-glossy-target="menu-buttons"]');
      const ribbon = document.querySelector('[data-glossy-target="ribbon"]');
      if (menuBar) menuBar.classList.remove('glossy-menubar');
      if (menuButtons) menuButtons.classList.remove('glossy-buttons', 'glossy-tabs');
      if (ribbon) ribbon.classList.remove('glossy-ribbon');
    } catch (error) {
      console.error('Error removing glossy effect:', error);
    }
  }

  function initializeDefaultPage() {
    if (pages.value.length === 0) {
      pages.value = [
        {
          id: `page-${Date.now()}`,
          name: 'Page 1',
          type: 'foreground',
          backgroundPageId: '',
          description: 'Default page',
          drawingType: 'default',
          shapes: [],
        },
        {
          id: `page-bg-${Date.now()}`,
          name: 'Background',
          type: 'background',
          backgroundPageId: '',
          description: 'Default background page',
          drawingType: 'default',
          shapes: [],
        },
      ];
      activePageId.value = pages.value[0].id;
    }
  }

  function addShape(shape) {
  // Simple version that just works
  console.log('Adding shape(s):', shape);
  
  // Convert to array if not already
  let shapesToAdd = Array.isArray(shape) ? shape : [shape];
  let newShapes = [];
  
  // Skip select shapes entirely
  if (shapesToAdd.some(s => s.type === 'select')) {
    console.log('Skipping addition of select shape');
    return shapesToAdd.length === 1 ? shapesToAdd[0] : shapesToAdd;
  }
  
  // Log the shapes we're adding
  console.log('Adding shapes:', JSON.stringify(shapesToAdd, null, 2));
  
  // Process each shape
  shapesToAdd.forEach((s, index) => {
    // Create a completely unique ID based on timestamp and random string
    const uniqueId = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a new shape object with all required properties
    let newShape;
    
    // Special handling for image shapes - they should have NO style properties
    if (s.type === 'image' || s.isImported) {
      // Create a completely clean image object with only essential properties
      newShape = {
        id: uniqueId,
        type: 'image',
        x: s.x !== undefined ? s.x : 0,
        y: s.y !== undefined ? s.y : 0,
        width: s.width !== undefined ? s.width : 100,
        height: s.height !== undefined ? s.height : 100,
        src: s.src,
        image: s.image,
        selectable: true,
        movable: true,
        rotation: s.rotation || 0,
        layerId: s.layerId || activeLayerId.value || 'layer-0',
        isImported: true
      };
      
      // Log that we're creating a clean image shape
      console.log('Creating clean image shape with NO style properties');
    } else {
      // For all other shapes, include style properties
      newShape = {
        ...s,
        id: uniqueId,
        layerId: s.layerId || activeLayerId.value || 'layer-0',
        x: s.x !== undefined ? s.x : 0,
        y: s.y !== undefined ? s.y : 0,
        width: s.width !== undefined ? s.width : 100,
        height: s.height !== undefined ? s.height : 100,
        selectable: s.selectable !== false,
        movable: s.movable !== false,
        rotation: s.rotation || 0,
fill: (s.fill && s.fill.match(/^#[0-9A-Fa-f]{6}$|^rgba\(\d+,\d+,\d+,\d+(\.\d+)?\)$/))
  ? s.fill
  : (s.fill === '#000000' ? '#000000' : '#3B82F6'),

stroke: (s.stroke && s.stroke.match(/^#[0-9A-Fa-f]{6}$|^rgba\(\d+,\d+,\d+,\d+(\.\d+)?\)$/))
  ? s.stroke
  : (s.stroke === '#000000' ? '#000000' : '#000000'),
      };
    }
    
    console.log(`Created shape with new unique ID: ${uniqueId}`);
    
    // Find the target layer
    let targetLayerId = newShape.layerId;
    let targetLayer = layers.value.find(layer => layer.id === targetLayerId);
    
    // If layer not found, use active layer
    if (!targetLayer) {
      targetLayerId = activeLayerId.value;
      targetLayer = layers.value.find(layer => layer.id === targetLayerId);
      newShape.layerId = targetLayerId;
      
      // If still no layer, create default
      if (!targetLayer) {
        console.log('No valid layer found, creating default layer');
        targetLayer = {
          id: 'layer-0',
          name: 'Layer 1',
          visible: true,
          frozen: false,
          opacity: 100,
          shapes: []
        };
        layers.value.push(targetLayer);
        activeLayerId.value = targetLayer.id;
        newShape.layerId = targetLayer.id;
      }
    }
    
    // Ensure layer has shapes array
    if (!targetLayer.shapes) {
      targetLayer.shapes = [];
    }
    
    // Add shape to layer
    targetLayer.shapes.push(newShape);
    console.log(`Added shape to layer ${targetLayer.id}, now has ${targetLayer.shapes.length} shapes`);
    
    // Add to our result list
    newShapes.push(newShape);
  });
  
  // Update the main shapes array directly
  const allShapes = getAllShapes();
  
  // Add all new shapes to the main shapes array
  shapes.value = [...allShapes];
  
  console.log('Updated shapes array, now has', shapes.value.length, 'shapes');
  
  // Save to history and mark document as modified
  saveToHistory();
  documentModified.value = true;
  performAutoSaveDebounced();
  
  return newShapes.length === 1 ? newShapes[0] : newShapes;
}

  function updateShape(updatedShape) {
    console.log('Updating shape:', updatedShape.id, 'with properties:', updatedShape);
    if (!shapes.value.find(s => s.id === updatedShape.id)) {
  console.warn('Shape not found, skipping update to prevent duplication:', updatedShape.id);
  return;
}
    
    // Ensure the updated shape has the movable property set
    if (updatedShape.movable === undefined) {
      updatedShape.movable = true;
      console.log('Added missing movable property to shape:', updatedShape.id);
    }
    
    // Ensure fill and stroke have valid values
    if (!updatedShape.fill || updatedShape.fill === '') {
      updatedShape.fill = '#3B82F6'; // Default blue if empty
      console.log('Added missing fill property to shape:', updatedShape.id);
    }
    
    // Handle fill transparency
    if (updatedShape.fill && (updatedShape.fill === 'rgba(255,255,255,0)' || updatedShape.fill === 'rgba(0,0,0,0)')) {
      // If the fill is an rgba with 0 alpha, set the transparency flag
      updatedShape.fill = '#000000'; 
      updatedShape._isFillTransparent = true;
      console.log('Converted rgba fill to transparent for shape:', updatedShape.id);
    } 
    
    // If _isFillTransparent is explicitly set in the update, respect that value
    // Otherwise, if it's undefined, set it to false
    if (updatedShape._isFillTransparent === undefined) {
      updatedShape._isFillTransparent = false;
      console.log('Setting default fill transparency (false) for shape:', updatedShape.id);
    } else {
      console.log(`Fill transparency flag is ${updatedShape._isFillTransparent} for shape:`, updatedShape.id);
    }
    
    // Force _isFillTransparent to false if we're setting a non-transparent color
    if (updatedShape.fill && updatedShape.fill !== '#000000' && updatedShape._isFillTransparent === true) {
      console.log('Forcing fill transparency to false for non-transparent color:', updatedShape.fill);
      updatedShape._isFillTransparent = false;
    }
    
    // Handle missing stroke
    if (!updatedShape.stroke || updatedShape.stroke === '') {
      updatedShape.stroke = '#000000'; 
      updatedShape._isStrokeTransparent = true; // Default black if empty
      console.log('Added missing stroke property to shape:', updatedShape.id);
    }
    
    // Handle stroke transparency
    if (updatedShape.stroke && (updatedShape.stroke === 'rgba(255,255,255,0)' || updatedShape.stroke === 'rgba(0,0,0,0)')) {
      // If the stroke is an rgba with 0 alpha, set the transparency flag
      updatedShape.stroke = '#000000'; 
      updatedShape._isStrokeTransparent = true; // Default transparent if empty
      console.log('Converted rgba stroke to transparent for shape:', updatedShape.id);
    }
    
    // If _isStrokeTransparent is explicitly set in the update, respect that value
    // Otherwise, if it's undefined, set it to false
    if (updatedShape._isStrokeTransparent === undefined) {
      updatedShape._isStrokeTransparent = false;
      console.log('Setting default stroke transparency (false) for shape:', updatedShape.id);
    } else {
      console.log(`Stroke transparency flag is ${updatedShape._isStrokeTransparent} for shape:`, updatedShape.id);
    }
    
    // Force _isStrokeTransparent to false if we're setting a non-transparent color
    if (updatedShape.stroke && updatedShape.stroke !== '#000000' && updatedShape._isStrokeTransparent === true) {
      console.log('Forcing stroke transparency to false for non-transparent color:', updatedShape.stroke);
      updatedShape._isStrokeTransparent = false;
    }
    
    // Create a merged shape with all properties
    const mergedShape = {
      ...updatedShape,
      // Ensure these properties are explicitly set
      x: updatedShape.x,
      y: updatedShape.y,
      movable: updatedShape.movable !== false,
      // Use the already validated and potentially converted fill/stroke values
      fill: updatedShape.fill,
      stroke: updatedShape.stroke
    };
    
    console.log('Merged shape for update:', mergedShape);
    
    // Update the shape in the main shapes array
    shapes.value = shapes.value.map((shape) =>
      shape.id === updatedShape.id ? mergedShape : shape
    );
    
    // Update the shape in its layer
    const layerIndex = layers.value.findIndex((layer) => layer.id === updatedShape.layerId);
    if (layerIndex !== -1) {
      layers.value[layerIndex].shapes = layers.value[layerIndex].shapes.map((shape) =>
        shape.id === updatedShape.id ? mergedShape : shape
      );
    }
    
    // Log the updated shape for debugging
    const updatedShapeInStore = shapes.value.find(s => s.id === updatedShape.id);
    console.log('Shape after update:', updatedShapeInStore);
    
    saveToHistory();
    documentModified.value = true;
    performAutoSaveDebounced();
  }

  function deleteShapes(shapeIds) {
    shapes.value = shapes.value.filter((shape) => !shapeIds.includes(shape.id));
    layers.value.forEach((layer) => {
      layer.shapes = layer.shapes.filter((shape) => !shapeIds.includes(shape.id));
    });
    selectedShapes.value = selectedShapes.value.filter((id) => !shapeIds.includes(id));
    saveToHistory();
    documentModified.value = true;
    performAutoSaveDebounced();
  }

  function selectShapes(shapeIds) {
    console.log('Selecting shapes, IDs:', shapeIds, 'Current shapes:', shapes.value.length);
selectedShapes.value = [...shapeIds];
  }

  function addLayer() {
    const maxId = Math.max(...layers.value.map((layer) => parseInt(layer.id.split('-')[1] || 0)), 0);
    const newLayer = {
      id: `layer-${maxId + 1}`,
      name: `Layer ${layers.value.length + 1}`,
      visible: true,
      frozen: false,
      opacity: 100,
      shapes: [],
    };
    layers.value.push(newLayer);
    activeLayerId.value = newLayer.id;
    saveToHistory();
  }

  function updateLayers(updatedLayers) {
    layers.value = [...updatedLayers];
    shapes.value = getAllShapes();
    saveToHistory();
  }

  function deleteLayer(index) {
    if (layers.value.length <= 1) return;
    const layerId = layers.value[index].id;
    layers.value.splice(index, 1);
    shapes.value = shapes.value.filter((shape) => shape.layerId !== layerId);
    if (activeLayerId.value === layerId) {
      activeLayerId.value = layers.value[0]?.id || '';
    }
    saveToHistory();
  }

  function moveLayer({ index, direction }) {
    if (direction === 'up' && index > 0) {
      const temp = layers.value[index - 1];
      layers.value[index - 1] = layers.value[index];
      layers.value[index] = temp;
      if (selectedLayerIndex.value === index) {
        activeLayerId.value = layers.value[index - 1].id;
      } else if (selectedLayerIndex.value === index - 1) {
        activeLayerId.value = layers.value[index].id;
      }
    } else if (direction === 'down' && index < layers.value.length - 1) {
      const temp = layers.value[index + 1];
      layers.value[index + 1] = layers.value[index];
      layers.value[index] = temp;
      if (selectedLayerIndex.value === index) {
        activeLayerId.value = layers.value[index + 1].id;
      } else if (selectedLayerIndex.value === index + 1) {
        activeLayerId.value = layers.value[index].id;
      }
    }
    saveToHistory();
  }

  function duplicateLayer(index) {
    const originalLayer = layers.value[index];
    const newLayer = { ...originalLayer, id: `layer-${Date.now()}`, name: `${originalLayer.name} (Copy)` };
    newLayer.shapes = newLayer.shapes.map((shape) => ({
      ...shape,
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    layers.value.splice(index + 1, 0, newLayer);
    activeLayerId.value = newLayer.id;
    shapes.value = getAllShapes();
    saveToHistory();
  }

  function mergeLayerDown(index) {
    if (index >= layers.value.length - 1) return;
    const upperLayer = layers.value[index];
    const lowerLayer = layers.value[index + 1];
    lowerLayer.shapes = [...lowerLayer.shapes, ...upperLayer.shapes];
    layers.value.splice(index, 1);
    if (selectedLayerIndex.value === index) {
      activeLayerId.value = lowerLayer.id;
    } else if (selectedLayerIndex.value > index) {
      activeLayerId.value = layers.value[selectedLayerIndex.value - 1].id;
    }
    shapes.value = getAllShapes();
    saveToHistory();
  }

  function clearLayer(index) {
    layers.value[index].shapes = [];
    shapes.value = getAllShapes();
    saveToHistory();
  }

  function renameLayer({ index, name }) {
    layers.value[index].name = name;
    saveToHistory();
  }

  function updateLayerOpacity({ index, opacity }) {
    layers.value[index].opacity = opacity;
    saveToHistory();
  }

  function toggleLayerVisibility(index) {
    layers.value[index].visible = !layers.value[index].visible;
    shapes.value = getAllShapes();
    saveToHistory();
  }

  function toggleLayerFreeze(index) {
    layers.value[index].frozen = !layers.value[index].frozen;
    saveToHistory();
  }

  function addPage(pageData) {
    const newPage = {
      id: `page-${Date.now()}`,
      name: pageData.name || 'New Page',
      type: pageData.type || 'foreground',
      backgroundPageId: pageData.backgroundPageId || '',
      description: pageData.description || '',
      drawingType: pageData.drawingType || 'default',
      shapes: [],
    };
    pages.value.push(newPage);
    activePageId.value = newPage.id;
    shapes.value = getPageShapes(newPage.id);
    saveToHistory();
  }

  function updatePage(updatedPage) {
    const index = pages.value.findIndex((p) => p.id === updatedPage.id);
    if (index !== -1) {
      pages.value[index] = { ...pages.value[index], ...updatedPage };
      saveToHistory();
    }
  }

  function movePage({ pageId, direction }) {
    const index = pages.value.findIndex((p) => p.id === pageId);
    if (index === -1) return;
    const newIndex = index + (direction === 'up' ? -1 : 1);
    if (newIndex < 0 || newIndex >= pages.value.length) return;
    const temp = pages.value[index];
    pages.value[index] = pages.value[newIndex];
    pages.value[newIndex] = temp;
    saveToHistory();
  }

  function deletePage(pageId) {
    if (pages.value.length <= 1) return;
    const index = pages.value.findIndex((p) => p.id === pageId);
    if (index !== -1) {
      pages.value.splice(index, 1);
      if (activePageId.value === pageId) {
        activePageId.value = pages.value[0]?.id || '';
        shapes.value = getPageShapes(activePageId.value);
      }
      saveToHistory();
    }
  }

function setActiveTab(tab) {
  activeTab.value = tab;
}
  function setActivePage(pageId) {
    if (activePageId.value !== pageId) {
      if (activePage.value) {
        pages.value = pages.value.map((page) =>
          page.id === activePageId.value ? { ...page, shapes: [...shapes.value] } : page
        );
      }
      activePageId.value = pageId;
      shapes.value = getPageShapes(pageId);
      selectedShapes.value = [];
      saveToHistory();
    }
  }

  function renamePage(pageId, name) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      page.name = name;
      saveToHistory();
    }
  }

  function togglePageType(pageId) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page && page.type === 'background') {
      const usedBy = pages.value.filter((p) => p.backgroundPageId === pageId);
      if (usedBy.length > 0) return false;
    }
    if (page) {
      page.type = page.type === 'foreground' ? 'background' : 'foreground';
      if (page.type === 'foreground') page.backgroundPageId = '';
      saveToHistory();
      return true;
    }
    return false;
  }

  function duplicatePage(pageId) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      const newPage = {
        ...JSON.parse(JSON.stringify(page)),
        id: `page-${Date.now()}`,
        name: `${page.name} (Copy)`,
      };
      pages.value.push(newPage);
      setActivePage(newPage.id);
      saveToHistory();
    }
  }

  function getPageShapes(pageId) {
    const page = pages.value.find((p) => p.id === pageId);
    if (!page) return [];
    let allShapes = [...(page.shapes || [])];
    if (page.type === 'foreground' && page.backgroundPageId) {
      const bgPage = pages.value.find((p) => p.id === page.backgroundPageId);
      if (bgPage) allShapes = [...(bgPage.shapes || []), ...allShapes];
    }
    return allShapes;
  }

  function setTool(tool) {
    console.log('Setting tool in store to:', tool);
    
    // If tool is null or undefined, default to 'select'
    if (tool === null || tool === undefined) {
      tool = 'select';
      console.log('Tool was null or undefined, defaulting to select');
    }
    
    currentTool.value = tool;
    
    // Apply text styles if the tool is text
    if (tool === 'text') {
      currentStyles.value = { ...currentStyles.value, ...textStyles.value };
    }
    
    console.log('Current tool is now:', currentTool.value);
  }

  function updateStyles(newStyles) {
    currentStyles.value = { ...currentStyles.value, ...newStyles };
  }

  function toggleGrid() {
    gridSize.value = gridSize.value ? 0 : 20;
  }

  function updateGridSettings({ gridSize: newSize, gridOpacity: newOpacity, gridType: newType, gridColor: newColor }) {
    console.log('Updating grid settings:', { newSize, newOpacity, newType, newColor });
    if (newSize !== undefined) gridSize.value = Number(newSize);
    if (newOpacity !== undefined) gridOpacity.value = Number(newOpacity); // Already a decimal value (0-1)
    if (newType !== undefined) gridType.value = newType;
    if (newColor !== undefined) gridColor.value = newColor;
    console.log('Updated grid settings:', { 
      gridSize: gridSize.value, 
      gridOpacity: gridOpacity.value, 
      gridType: gridType.value, 
      gridColor: gridColor.value 
    });
  }

  function toggleRulers() {
    showRulers.value = !showRulers.value;
  }

  function toggleSnapToGrid() {
    snapToGrid.value = !snapToGrid.value;
  }

  function toggleLayersPanel() {
    showLayers.value = !showLayers.value;
  }

  function toggleShapeLibrary() {
    if (!showShapeLibrary.value) {
      const centerX = Math.max(window.innerWidth / 2 - 150, 0);
      const centerY = Math.max(window.innerHeight / 2 - 300, 0);
      shapeLibraryPosition.value = { x: centerX, y: centerY };
    }
    showShapeLibrary.value = !showShapeLibrary.value;
  }

  function startDragShapeLibrary(event) {
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    if (!clientX || !clientY || (event.type === 'mousedown' && event.button !== 0)) return;
    isDraggingShapeLibrary.value = true;
    dragOffsetShapeLibrary.value = {
      x: clientX - shapeLibraryPosition.value.x,
      y: clientY - shapeLibraryPosition.value.y,
    };
    if (event.type === 'mousedown') {
      document.addEventListener('mousemove', dragShapeLibrary);
      document.addEventListener('mouseup', endDragShapeLibrary);
    } else {
      document.addEventListener('touchmove', dragShapeLibrary);
      document.addEventListener('touchend', endDragShapeLibrary);
    }
    event.preventDefault();
  }

  function dragShapeLibrary(event) {
    if (!isDraggingShapeLibrary.value) return;
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    if (!clientX || !clientY) return;
    const newX = clientX - dragOffsetShapeLibrary.value.x;
    const newY = clientY - dragOffsetShapeLibrary.value.y;
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    shapeLibraryPosition.value = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    };
    event.preventDefault();
  }

  function endDragShapeLibrary(event) {
    if (!isDraggingShapeLibrary.value) return;
    isDraggingShapeLibrary.value = false;
    document.removeEventListener('mousemove', dragShapeLibrary);
    document.removeEventListener('mouseup', endDragShapeLibrary);
    document.removeEventListener('touchmove', dragShapeLibrary);
    document.removeEventListener('touchend', endDragShapeLibrary);
    if (event) event.preventDefault();
  }

  function togglePageTabs() {
    if (!showPageTabs.value) {
      const centerX = Math.max(window.innerWidth / 2 - 150, 0);
      const centerY = Math.max(window.innerHeight / 2 - 200, 0);
      pageTabsPosition.value = { x: centerX, y: centerY };
    }
    showPageTabs.value = !showPageTabs.value;
  }

  function startDragPageTabs(event) {
    if (event.button !== 0) return;
    isDraggingPageTabs.value = true;
    const rect = event.target.closest('.fixed').getBoundingClientRect();
    dragOffsetPageTabs.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    document.addEventListener('mousemove', dragPageTabs);
    document.addEventListener('mouseup', endDragPageTabs);
    event.preventDefault();
  }

  function dragPageTabs(event) {
    if (!isDraggingPageTabs.value) return;
    pageTabsPosition.value = {
      x: event.clientX - dragOffsetPageTabs.value.x,
      y: event.clientY - dragOffsetPageTabs.value.y,
    };
  }

  function endDragPageTabs() {
    isDraggingPageTabs.value = false;
    document.removeEventListener('mousemove', dragPageTabs);
    document.removeEventListener('mouseup', endDragPageTabs);
  }

  function showPageContextMenu(event, page) {
    contextMenuPage.value = page;
    contextMenuPosition.value = { x: event.clientX, y: event.clientY };
    document.addEventListener('click', closeContextMenu);
  }

  function closeContextMenu() {
    contextMenuPage.value = null;
    document.removeEventListener('click', closeContextMenu);
  }

  function toggleCalculator() {
    showCalculator.value = !showCalculator.value;
  }

  function toggleColorPicker() {
    showColorPicker.value = !showColorPicker.value;
  }

  function applySelectedColor(color, isTransparent = false, isFill = true) {
    console.log('Applying color:', { color, isTransparent, isFill });
    
    if (isFill) {
      // Always update the current styles
      currentStyles.value = { ...currentStyles.value, fill: color, _isFillTransparent: isTransparent };
      
      if (selectedShapes.value.length > 0) {
        selectedShapes.value.forEach((id) => {
          const shape = shapes.value.find((s) => s.id === id);
          if (shape) {
            const updatedShape = { ...shape };
            
            // Set the fill color
            updatedShape.fill = color;
            
            // Explicitly set the transparency flag based on the isTransparent parameter
            updatedShape._isFillTransparent = isTransparent;
            
            console.log(`Setting fill color to ${color} with transparency=${isTransparent} for shape:`, shape.id);
            
            // Update the shape with the new properties
            updateShape(updatedShape);
          }
        });
      }
    } else {
      // Always update the current styles
      currentStyles.value = { ...currentStyles.value, stroke: color, _isStrokeTransparent: isTransparent };
      
      if (selectedShapes.value.length > 0) {
        selectedShapes.value.forEach((id) => {
          const shape = shapes.value.find((s) => s.id === id);
          if (shape) {
            const updatedShape = { ...shape };
            
            // Set the stroke color
            updatedShape.stroke = color;
            
            // Explicitly set the transparency flag based on the isTransparent parameter
            updatedShape._isStrokeTransparent = isTransparent;
            
            console.log(`Setting stroke color to ${color} with transparency=${isTransparent} for shape:`, shape.id);
            
            // Update the shape with the new properties
            updateShape(updatedShape);
          }
        });
      }
    }
  }

  function togglePartPropertiesDialog(properties) {
    partPropertiesData.value = { ...properties };
    showPartPropertiesDialog.value = true;
  }

  function applyPartProperties(properties) {
    if (pendingShapeData.value) {
      createShapeFromLibrary({ clientX: 400, clientY: 300 }, properties);
    }
    showPartPropertiesDialog.value = false;
    pendingShapeData.value = null;
  }

  function toggleBOMGenerator() {
    showBOMGenerator.value = !showBOMGenerator.value;
  }
  
  function toggleKeyboardShortcuts() {
    showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
  }

  function handleShapeDragStart(shape) {
    draggedShapeData.value = shape;
    setTool('select');
  }

  function handleAddShape(shapeData) {
    pendingShapeData.value = shapeData.data || shapeData.shapeData;
    if (shapeData.partProperties) {
      togglePartPropertiesDialog(shapeData.partProperties);
    } else {
      createShapeFromLibrary({ clientX: 400, clientY: 300 }, null);
    }
  }

  function handleCanvasDrop(event) {
    setTool('select');
    let parsedData = null;
    try {
      let data = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
      if (data) parsedData = JSON.parse(data);
    } catch (e) {
      console.warn('Could not parse drop data:', e);
    }
    if (parsedData && parsedData.type === 'library-shape') {
      pendingShapeData.value = parsedData.shapeData;
      if (parsedData.partProperties) {
        togglePartPropertiesDialog(parsedData.partProperties);
      } else {
        createShapeFromLibrary(event, null);
      }
    } else if (draggedShapeData.value) {
      pendingShapeData.value = draggedShapeData.value.data || draggedShapeData.value.shapeData;
      if (draggedShapeData.value.partProperties) {
        togglePartPropertiesDialog(draggedShapeData.value.partProperties);
      } else {
        createShapeFromLibrary(event, null);
      }
      draggedShapeData.value = null;
    }
  }

  function createShapeFromLibrary(event, partProperties) {
    if (!pendingShapeData.value) return;
    setTool('select');
    const canvasRect = event.target?.closest('canvas')?.getBoundingClientRect();
    let x = canvasRect ? (event.clientX || 400) - canvasRect.left : 400;
    let y = canvasRect ? (event.clientY || 300) - canvasRect.top : 300;
    if (canvasRect && event.canvasX !== undefined && event.canvasY !== undefined) {
      x = event.canvasX;
      y = event.canvasY;
    } else if (event.clientX && event.clientY && canvasRect) {
      const zoom = 1; // Assume zoom is managed by CanvasWorkspace
      x = (event.clientX - canvasRect.left - (canvasWidth.value * (1 - zoom)) / 2) / zoom;
      y = (event.clientY - canvasRect.top - (canvasHeight.value * (1 - zoom)) / 2) / zoom;
    }
    let newShape;
    switch (pendingShapeData.value.type) {
      case 'rect':
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'rectangle',
          x,
          y,
          width: pendingShapeData.value.width || 100,
          height: pendingShapeData.value.height || 100,
          fill: pendingShapeData.value.fill || currentStyles.value.fill || '#3B82F6',
          stroke: currentStyles.value.stroke || '#2563EB',
          strokeWidth: currentStyles.value.strokeWidth || 2,
          rotation: 0,
          layerId: activeLayerId.value,
        };
        break;
      case 'circle':
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'circle',
          x,
          y,
          width: pendingShapeData.value.radius ? pendingShapeData.value.radius * 2 : 100,
          height: pendingShapeData.value.radius ? pendingShapeData.value.radius * 2 : 100,
          radius: pendingShapeData.value.radius || 50,
          fill: pendingShapeData.value.fill || currentStyles.value.fill || '#3B82F6',
          stroke: currentStyles.value.stroke || '#2563EB',
          strokeWidth: currentStyles.value.strokeWidth || 2,
          rotation: 0,
          layerId: activeLayerId.value,
        };
        break;
      case 'polygon':
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'polygon',
          x,
          y,
          width: pendingShapeData.value.width || 100,
          height: pendingShapeData.value.height || 100,
          points: pendingShapeData.value.points || [],
          fill: pendingShapeData.value.fill || currentStyles.value.fill || '#3B82F6',
          stroke: currentStyles.value.stroke || '#2563EB',
          strokeWidth: currentStyles.value.strokeWidth || 2,
          rotation: 0,
          layerId: activeLayerId.value,
        };
        break;
      case 'group':
        const shapes = pendingShapeData.value.shapes.map((shape) => ({
          ...shape,
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: x + (shape.x - pendingShapeData.value.shapes[0].x),
          y: y + (shape.y - pendingShapeData.value.shapes[0].y),
          layerId: activeLayerId.value,
          fill: shape.fill || '#3B82F6',
          stroke: shape.stroke || '#2563EB',
        }));
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'group',
          x,
          y,
          shapes,
          layerId: activeLayerId.value,
        };
        break;
      case 'svg':
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'svg',
          x,
          y,
          width: pendingShapeData.value.width || 100,
          height: pendingShapeData.value.height || 100,
          content: pendingShapeData.value.content,
          fill: '#FFFFFF',
          stroke: '#2563EB',
          strokeWidth: 1,
          layerId: activeLayerId.value,
        };
        break;
      case 'image':
        newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'image',
          x,
          y,
          width: pendingShapeData.value.width || 100,
          height: pendingShapeData.value.height || 100,
          src: pendingShapeData.value.src,
          fill: '#FFFFFF',
          stroke: '#2563EB',
          strokeWidth: 1,
          layerId: activeLayerId.value,
        };
        break;
    }
    if (newShape && partProperties) {
      newShape.partProperties = { ...partProperties };
    }
    if (newShape) {
      addShape(newShape);
      selectShapes([newShape.id]);
    }
  }

  function addLibraryShape(shape) {
    libraryShapes.value.push({
      ...shape,
      id: `shape_${Date.now()}`,
      libraryId: shape.libraryId || 'default',
    });
    saveToHistory();
  }

  function clearCanvas() {
    shapes.value = [];
    selectedShapes.value = [];
    layers.value = [
      { id: `layer-${Date.now()}`, name: 'Layer 1', visible: true, frozen: false, opacity: 100, shapes: [] },
    ];
    activeLayerId.value = layers.value[0].id;
    history.value = [];
    historyIndex.value = -1;
    saveToHistory();
  }

  function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csp';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // First, load the layers to ensure they exist before assigning shapes
          if (data.layers && Array.isArray(data.layers)) {
            // Ensure all layers are visible when opening a file
            const visibleLayers = data.layers.map(layer => ({
              ...layer,
              visible: true // Force all layers to be visible
            }));
            layers.value = visibleLayers;
            console.log('Loaded layers with visibility forced to true:', visibleLayers);
          } else {
            // If no layers in file, create a default layer
            layers.value = [
              { id: `layer-${Date.now()}`, name: 'Layer 1', visible: true, frozen: false, opacity: 100, shapes: [] },
            ];
          }
          
          // Set active layer
          if (data.activeLayerId && layers.value.some(layer => layer.id === data.activeLayerId)) {
            activeLayerId.value = data.activeLayerId;
          } else {
            activeLayerId.value = layers.value[0].id;
          }
          
          // Load shapes and validate layerIds
          if (data.shapes && Array.isArray(data.shapes)) {
            // Filter out shapes with invalid layerIds
            shapes.value = data.shapes.filter(shape => {
              // If shape has no layerId, assign it to the active layer
              if (!shape.layerId) {
                shape.layerId = activeLayerId.value;
                return true;
              }
              
              // Check if the layerId exists in the loaded layers
              const layerExists = layers.value.some(layer => layer.id === shape.layerId);
              if (!layerExists) {
                console.warn(`Shape with id ${shape.id} has invalid layerId ${shape.layerId}. Assigning to active layer.`);
                shape.layerId = activeLayerId.value;
              }
              
              return true;
            });
          } else {
            shapes.value = [];
          }
          
          // Load pages if available
          if (data.pages && Array.isArray(data.pages)) {
            pages.value = data.pages;
            if (data.activePageId && pages.value.some(page => page.id === data.activePageId)) {
              activePageId.value = data.activePageId;
            } else if (pages.value.length > 0) {
              activePageId.value = pages.value[0].id;
            }
          }
          
          // Clear selection
          selectedShapes.value = [];
          
          // Reset the tool to select mode
          currentTool.value = 'select';
          console.log('Tool reset to select mode after file load');
          
          // Save to history
          saveToHistory();
          
          console.log('File loaded successfully:', {
            shapes: shapes.value.length,
            layers: layers.value.length,
            pages: pages.value.length,
            currentTool: currentTool.value
          });
          
        } catch (error) {
          console.error('Error opening file:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function saveFile() {
    // Create a complete data object with all necessary information
    const data = {
      shapes: shapes.value,
      layers: layers.value,
      pages: pages.value,
      activeLayerId: activeLayerId.value,
      activePageId: activePageId.value,
      version: appVersion.value,
      savedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${documentName.value}.csp`);
    console.log('File saved successfully:', documentName.value);
  }

  function saveFileAs() {
    // Create a complete data object with all necessary information
    const data = {
      shapes: shapes.value,
      layers: layers.value,
      pages: pages.value,
      activeLayerId: activeLayerId.value,
      activePageId: activePageId.value,
      version: appVersion.value,
      savedAt: new Date().toISOString()
    };
    
    const filename = prompt('Enter filename (without extension):', documentName.value) || documentName.value;
    documentName.value = filename; // Update the document name
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${filename}.csp`);
    console.log('File saved as:', filename);
  }

  function exportAsPDF(canvas) {
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const a4Width = 297;
    const a4Height = 210;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = canvasWidth / canvasHeight;
    let imgWidth = a4Width;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > a4Height) {
      imgHeight = a4Height;
      imgWidth = imgHeight * aspectRatio;
    }
    const xOffset = (a4Width - imgWidth) / 2;
    const yOffset = (a4Height - imgHeight) / 2;
    pdf.addImage(dataURL, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save('canvas.pdf');
  }

  function exportAsPNG(canvas) {
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    saveAs(dataURL, 'canvas.png');
  }

  function exportAsSVG() {
    const svg = `<svg width="${canvasWidth.value}" height="${canvasHeight.value}" xmlns="http://www.w3.org/2000/svg">
      ${shapes.value
        .map((shape) => {
          if (shape.type === 'rectangle') {
            return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" stroke="${shape.stroke}" fill="${shape.fill}" stroke-width="${shape.lineWidth}"/>`;
          } else if (shape.type === 'circle') {
            const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
            return `<circle cx="${shape.x}" cy="${shape.y}" r="${radius}" stroke="${shape.stroke}" fill="${shape.fill}" stroke-width="${shape.lineWidth}"/>`;
          }
          return '';
        })
        .join('')}
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    saveAs(blob, 'canvas.svg');
  }

  function exportAsJSON() {
    const data = { shapes: shapes.value };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    saveAs(blob, 'canvas.json');
  }

  function importFile(params) {
    // Handle both object parameter and direct parameters
    let file, type;
    
    if (params && typeof params === 'object' && params.file) {
      // If params is an object with file and type properties
      file = params.file;
      type = params.type;
      
      console.log('Importing file in store:', { file, type });
      
      if (!file) {
        console.error('No file provided for import');
        return;
      }
    } else if (params && typeof params === 'string') {
      // If params is just a string representing the file type (from Ribbon)
      type = params;
      console.log('Creating file input for import type:', type);
      
      // Create a file input element to trigger file selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'png' ? '.png' : type === 'svg' ? '.svg' : '.json';
      
      input.onchange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
          // Call importFile again with the selected file
          importFile({ file: selectedFile, type });
        }
      };
      
      // Trigger the file selection dialog
      input.click();
      return;
    } else {
      // Invalid parameters
      console.error('Import called with invalid parameters');
      return;
    }
      if (type === 'png') {
        console.log('Starting PNG import process');
        
        try {
          // Create a file reader
          const reader = new FileReader();
          
          // Set up the onload handler
          reader.onload = (event) => {
            console.log('PNG file loaded, creating image');
            
            try {
              // Create a new image element
              const img = new Image();
              
              // Set up the onload handler for the image
              img.onload = () => {
                try {
                  console.log('PNG image loaded successfully, dimensions:', img.width, 'x', img.height);
                  
                  // Calculate a reasonable size for the image
                  let displayWidth = img.width;
                  let displayHeight = img.height;
                  
                  const maxDimension = 500; // Maximum dimension for imported images
                  
                  if (displayWidth > maxDimension || displayHeight > maxDimension) {
                    if (displayWidth > displayHeight) {
                      const ratio = displayHeight / displayWidth;
                      displayWidth = maxDimension;
                      displayHeight = maxDimension * ratio;
                    } else {
                      const ratio = displayWidth / displayHeight;
                      displayHeight = maxDimension;
                      displayWidth = maxDimension * ratio;
                    }
                  }
                  
                  // Create the shape object - ONLY INCLUDE ESSENTIAL PROPERTIES FOR IMAGES
                  // NO STYLE PROPERTIES AT ALL FOR IMAGES
                  const newShape = {
                    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'image',
                    x: 100, // Position it in a visible area
                    y: 100,
                    width: displayWidth,
                    height: displayHeight,
                    src: event.target.result,
                    image: img,
                    selectable: true,
                    movable: true,
                    rotation: 0,
                    layerId: activeLayerId.value,
                    // Flag to indicate this is an imported image
                    isImported: true
                  };
                  
                  console.log('Adding PNG image shape with dimensions:', displayWidth, 'x', displayHeight);
                  
                  // Add the shape to the canvas
                  const addedShape = addShape(newShape);
                  console.log('PNG image shape added successfully:', addedShape);
                  
                  // Force a render to show the image
                  documentModified.value = true;
                } catch (err) {
                  console.error('Error processing loaded image:', err);
                }
              };
              
              // Set up error handling for the image
              img.onerror = (err) => {
                console.error('Failed to load PNG image:', err);
              };
              
              // Set the source to load the image
              img.src = event.target.result;
              
              // If the image is already cached, the onload event might not fire
              if (img.complete) {
                console.log('Image already loaded from cache, triggering onload manually');
                img.onload();
              }
            } catch (err) {
              console.error('Error creating image element:', err);
            }
          };
          
          // Set up error handling for the file reader
          reader.onerror = (err) => {
            console.error('Error reading PNG file:', err);
          };
          
          // Read the file as a data URL
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Error in PNG import process:', err);
        }
      } else if (type === 'json') {
        console.log('Starting JSON import process');
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            console.log('JSON file loaded, parsing content');
            const jsonContent = event.target.result;
            console.log('JSON content length:', jsonContent.length);
            
            const data = JSON.parse(jsonContent);
            console.log('JSON parsed:', data);
            
            if (data.shapes && Array.isArray(data.shapes)) {
              console.log('Found', data.shapes.length, 'shapes in JSON');
              
              data.shapes.forEach((shape, index) => {
                console.log('Processing shape', index, ':', shape.type);
                // Create a new shape with proper properties
               let newShape = {
                ...shape,
                id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                selectable: true,
                movable: true
               };
                // Ensure the shape has a valid layer ID
                if (!newShape.layerId) {
                  newShape.layerId = activeLayerId.value;
                }
                // Special handling for image shapes
                if (newShape.type === 'image') {
                  // For image shapes, create a new clean object with only essential properties
                  // NO STYLE PROPERTIES AT ALL FOR IMAGES
                 const imageShape = {
                  id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                       type: 'image',
                     x: newShape.x || 0,
                        y: newShape.y || 0,
                   width: newShape.width || 100,
                   height: newShape.height || 100,
                    src: newShape.src,
                     image: newShape.image,
                       selectable: true,
                       movable: true,
                       rotation: newShape.rotation || 0,
                       layerId: activeLayerId.value,
                        isImported: true,
                      fill: null,
                        stroke: null,
                        lineWidth: 0
};
                  
                  // Replace the original shape with our clean version
                  newShape = imageShape;
                  console.log('Created clean image shape for imported JSON');
                }
                console.log('Adding shape from JSON:', newShape);
                addShape(newShape);
              });
              
              console.log('All JSON shapes processed');
            } else {
              console.warn('No shapes array found in JSON or shapes is not an array');
            }
          } catch (error) {
            console.error('Error importing JSON:', error);
          }
        };
        reader.readAsText(file);
      } else if (type === 'svg') {
        console.log('Starting SVG import process');
        
        try {
          const reader = new FileReader();
          
          reader.onload = (event) => {
            try {
              console.log('SVG file loaded, importing as image');
              
              // Always import SVG as an image to avoid parsing issues
              const svgContent = event.target.result;
              const svgBlob = new Blob([svgContent], {type: 'image/svg+xml'});
              const url = URL.createObjectURL(svgBlob);
              
              const img = new Image();
              
              img.onload = () => {
                try {
                  console.log('SVG loaded as image, dimensions:', img.width, 'x', img.height);
                  
                  // Calculate a reasonable size for the image
                  let displayWidth = img.width;
                  let displayHeight = img.height;
                  
                  const maxDimension = 500; // Maximum dimension for imported images
                  
                  if (displayWidth > maxDimension || displayHeight > maxDimension) {
                    if (displayWidth > displayHeight) {
                      const ratio = displayHeight / displayWidth;
                      displayWidth = maxDimension;
                      displayHeight = maxDimension * ratio;
                    } else {
                      const ratio = displayWidth / displayHeight;
                      displayHeight = maxDimension;
                      displayWidth = maxDimension * ratio;
                    }
                  }
                  
                  // Create the shape object - ONLY INCLUDE ESSENTIAL PROPERTIES FOR IMAGES
                  // NO STYLE PROPERTIES AT ALL FOR IMAGES
                  const newShape = {
                    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'image',
                    x: 100, // Position it in a visible area
                    y: 100,
                    width: displayWidth,
                    height: displayHeight,
                    src: url,
                    image: img,
                    selectable: true,
                    movable: true,
                    rotation: 0,
                    layerId: activeLayerId.value,
                    // Flag to indicate this is an imported image
                    isImported: true
                  };
                  
                  console.log('Adding SVG image shape with dimensions:', displayWidth, 'x', displayHeight);
                  
                  // Add the shape to the canvas
                  const addedShape = addShape(newShape);
                  console.log('SVG image shape added successfully:', addedShape);
                  
                  // Force a render to show the image
                  documentModified.value = true;
                } catch (err) {
                  console.error('Error processing loaded SVG image:', err);
                }
              };
              
              img.onerror = (err) => {
                console.error('Failed to load SVG as image:', err);
              };
              
              img.src = url;
            } catch (err) {
              console.error('Error processing SVG file:', err);
            }
          };
          
          reader.onerror = (err) => {
            console.error('Error reading SVG file:', err);
          };
          
          reader.readAsText(file);
        } catch (err) {
          console.error('Error in SVG import process:', err);
        }
      }
  }

  function getAllShapes() {
    let allShapes = [];
    const idMap = new Map(); // Map to track shapes by ID
    
    // Process each layer
    layers.value.forEach((layer) => {
      if (layer.shapes && Array.isArray(layer.shapes)) {
        // Filter out invalid shapes and 'select' type shapes
        const validShapes = layer.shapes.filter((shape) => 
          shape && 
          typeof shape === 'object' && 
          shape.type && 
          shape.type !== 'select' && 
          shape.id // Must have an ID
        );
        
        // Map shapes to ensure they have all required properties
        validShapes.forEach((shape) => {
          // Create a new object to avoid reference issues
          const processedShape = {
            ...shape,
            id: shape.id, // Preserve the original ID
            layerId: layer.id, // Ensure layer ID is set
            // Handle coordinates and dimensions with proper null/undefined checks
            x: shape.x !== undefined ? shape.x : 0,
            y: shape.y !== undefined ? shape.y : 0,
          };
          
          // Special handling for width/height based on shape type
          if (['pen', 'line', 'arrow'].includes(shape.type)) {
            // These shapes can have any width/height
            processedShape.width = shape.width;
            processedShape.height = shape.height;
          } else {
            // Other shapes need default values if not set
            processedShape.width = shape.width !== undefined ? shape.width : 100;
            processedShape.height = shape.height !== undefined ? shape.height : 100;
          }
          
          // Ensure these properties are set for proper interaction
          processedShape.selectable = shape.selectable !== false; // Default to true unless explicitly set to false
          processedShape.movable = shape.movable !== false; // Default to true unless explicitly set to false
          processedShape.rotation = shape.rotation || 0;
          
          // Ensure fill and stroke have valid values
          processedShape.fill = (shape.fill && shape.fill !== '') ? shape.fill : '#3B82F6'; // Default blue if empty
          processedShape.stroke = (shape.stroke && shape.stroke !== '') ? shape.stroke : '#000000'; // Default black if empty
          
          // Special handling for image shapes
          if (shape.type === 'image') {
            // Preserve the image object if it's valid
            if (shape.image instanceof HTMLImageElement) {
              processedShape.image = shape.image;
            } 
            // If we have a src but no valid image, create a new one
            else if (shape.src && (!shape.image || !(shape.image instanceof HTMLImageElement))) {
              const img = new Image();
              img.src = shape.src;
              processedShape.image = img;
              processedShape.isLoading = true;
              processedShape.imageError = null;
            }
          }
          
          // Check if we already have a shape with this ID
          if (idMap.has(processedShape.id)) {
            console.warn(`Duplicate shape ID found: ${processedShape.id}. Using the most recent one.`);
            // Replace the existing shape with this one (assuming it's more recent)
            idMap.set(processedShape.id, processedShape);
          } else {
            // Add this shape to our map
            idMap.set(processedShape.id, processedShape);
          }
        });
      }
    });
    
    // Convert the map values to an array
    allShapes = Array.from(idMap.values());
    
    // Log the result
    console.log('getAllShapes found', allShapes.length, 'shapes across all layers');
    
    return allShapes;
  }

  function saveToHistory() {
    // Create a deep copy of shapes with special handling for image objects
    const processedShapes = shapes.value.map(shape => {
      // Create a new object without the image property
      const { image, ...shapeWithoutImage } = shape;
      
      // For image shapes, preserve the src but not the actual image object
      if (shape.type === 'image') {
        return {
          ...shapeWithoutImage,
          // Keep track that this shape had a valid image
          hasImage: shape.image instanceof HTMLImageElement && shape.image.complete
        };
      }
      
      return shapeWithoutImage;
    });
    
    // Process layers to remove image objects
    const processedLayers = layers.value.map(layer => {
      if (!layer.shapes || !Array.isArray(layer.shapes)) {
        return layer;
      }
      
      const processedLayerShapes = layer.shapes.map(shape => {
        const { image, ...shapeWithoutImage } = shape;
        
        if (shape.type === 'image') {
          return {
            ...shapeWithoutImage,
            hasImage: shape.image instanceof HTMLImageElement && shape.image.complete
          };
        }
        
        return shapeWithoutImage;
      });
      
      return {
        ...layer,
        shapes: processedLayerShapes
      };
    });
    
    const state = {
      shapes: processedShapes,
      layers: processedLayers,
      pages: JSON.parse(JSON.stringify(pages.value)),
      activeLayerId: activeLayerId.value,
      activePageId: activePageId.value,
      selectedShapes: [...selectedShapes.value],
    };
    
    history.value = history.value.slice(0, historyIndex.value + 1);
    history.value.push(state);
    historyIndex.value++;
    if (history.value.length > 30) {
      history.value = history.value.slice(-30);
      historyIndex.value = history.value.length - 1;
    }
  }

  function undo() {
    if (historyIndex.value <= 0) return;
    historyIndex.value--;
    applyHistoryState(history.value[historyIndex.value]);
  }

  function redo() {
    if (historyIndex.value >= history.value.length - 1) return;
    historyIndex.value++;
    applyHistoryState(history.value[historyIndex.value]);
  }

  function applyHistoryState(state) {
    // Process shapes to restore image objects where needed
    const processedShapes = state.shapes.map(shape => {
      // For image shapes, we need to handle the image property
      if (shape.type === 'image' && shape.src) {
        // If this shape already has a valid image, keep it
        const existingShape = shapes.value.find(s => s.id === shape.id);
        if (existingShape && 
            existingShape.image instanceof HTMLImageElement && 
            existingShape.image.complete) {
          return {
            ...shape,
            image: existingShape.image
          };
        }
        
        // Otherwise, we'll need to create a new image
        const img = new Image();
        img.src = shape.src;
        
        return {
          ...shape,
          image: img,
          isLoading: true,
          imageError: null
        };
      }
      
      return shape;
    });
    
    // Process layers to restore image objects
    const processedLayers = state.layers.map(layer => {
      if (!layer.shapes || !Array.isArray(layer.shapes)) {
        return layer;
      }
      
      const processedLayerShapes = layer.shapes.map(shape => {
        if (shape.type === 'image' && shape.src) {
          // Check if this shape already exists in current layers with a valid image
          const existingShape = findShapeInLayers(shape.id);
          if (existingShape && 
              existingShape.image instanceof HTMLImageElement && 
              existingShape.image.complete) {
            return {
              ...shape,
              image: existingShape.image
            };
          }
          
          // Otherwise, create a new image
          const img = new Image();
          img.src = shape.src;
          
          return {
            ...shape,
            image: img,
            isLoading: true,
            imageError: null
          };
        }
        
        return shape;
      });
      
      return {
        ...layer,
        shapes: processedLayerShapes
      };
    });
    
    shapes.value = [...processedShapes];
    layers.value = [...processedLayers];
    pages.value = [...state.pages];
    activeLayerId.value = state.activeLayerId;
    activePageId.value = state.activePageId;
    selectedShapes.value = [...state.selectedShapes];
  }
  
  // Helper function to find a shape in all layers
  function findShapeInLayers(shapeId) {
    for (const layer of layers.value) {
      if (layer.shapes && Array.isArray(layer.shapes)) {
        const shape = layer.shapes.find(s => s.id === shapeId);
        if (shape) return shape;
      }
    }
    return null;
  }

  function initAutoSave() {
    if (!autoSaveEnabled.value) return;
    if (autoSaveTimer.value) clearInterval(autoSaveTimer.value);
    autoSaveTimer.value = setInterval(() => {
      if (documentModified.value) performAutoSave();
    }, autoSaveInterval.value);
  }

  function performAutoSave() {
    try {
      autoSaveStatus.value = 'saving';
      autoSaveMessage.value = 'Saving...';
      const saveData = {
        version: appVersion.value,
        timestamp: new Date().toISOString(),
        documentName: documentName.value,
        shapes: shapes.value,
        layers: layers.value,
        selectedLayerIndex: selectedLayerIndex.value,
        gridSize: gridSize.value,
        gridOpacity: gridOpacity.value,
        gridType: gridType.value,
        gridColor: gridColor.value,
        showRulers: showRulers.value,
        snapToGrid: snapToGrid.value,
      };
      localStorage.setItem(
        localStorageKey.value + (documentName.value || 'untitled').replace(/\s+/g, '_').toLowerCase(),
        JSON.stringify(saveData)
      );
      lastAutoSave.value = new Date();
      autoSaveStatus.value = 'saved';
      autoSaveMessage.value = `Saved at ${lastAutoSave.value.toLocaleTimeString()}`;
      setTimeout(() => {
        autoSaveStatus.value = null;
        autoSaveMessage.value = '';
      }, 3000);
    } catch (error) {
      autoSaveStatus.value = 'error';
      autoSaveMessage.value = 'Save failed!';
      setTimeout(() => {
        autoSaveStatus.value = null;
        autoSaveMessage.value = '';
      }, 5000);
    }
  }

  let autoSaveDebounceTimer = null;
  function performAutoSaveDebounced() {
    clearTimeout(autoSaveDebounceTimer);
    autoSaveDebounceTimer = setTimeout(() => {
      performAutoSave();
    }, 5000);
  }

  function loadAutoSavedData() {
    try {
      const key = localStorageKey.value + (documentName.value || 'untitled').replace(/\s+/g, '_').toLowerCase();
      const savedData = localStorage.getItem(key);
      if (!savedData) return;
      const data = JSON.parse(savedData);
      return { data, timestamp: new Date(data.timestamp) };
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    }
  }

  function restoreAutoSavedData(data) {
    try {
      documentName.value = data.documentName || 'Untitled';
      shapes.value = data.shapes || [];
      layers.value = data.layers || [
        { id: `layer-${Date.now()}`, name: 'Layer 1', visible: true, frozen: false, opacity: 100, shapes: [] },
      ];
      activeLayerId.value = layers.value[data.selectedLayerIndex || 0]?.id || layers.value[0].id;
      gridSize.value = data.gridSize || 20;
      gridOpacity.value = data.gridOpacity || 0.5;
      gridType.value = data.gridType || 'square';
      gridColor.value = data.gridColor || '#000000';
      showRulers.value = data.showRulers || false;
      snapToGrid.value = data.snapToGrid || false;
      history.value = [JSON.stringify(shapes.value)];
      historyIndex.value = 0;
      saveToHistory();
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
    }
  }

  function cutShapes() {
    if (selectedShapes.value.length > 0) {
      clipboard.value = selectedShapesObjects.value.map((shape) => ({ ...shape }));
      deleteShapes(selectedShapes.value);
    }
  }

  function copyShapes() {
    if (selectedShapes.value.length > 0) {
      clipboard.value = selectedShapesObjects.value.map((shape) => ({ ...shape }));
    }
  }

  function pasteShapes() {
    if (clipboard.value.length > 0) {
      const newShapes = clipboard.value.map((shape) => ({
        ...shape,
        id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: shape.x + 20,
        y: shape.y + 20,
      }));
      newShapes.forEach(addShape);
      selectShapes(newShapes.map((shape) => shape.id));
    }
  }

  function setActiveTab(tab) {
    activeTab.value = tab;
  }

  function toggleSplashScreen() {
    showSplashScreen.value = !showSplashScreen.value;
  }

  return {
    // State
    shapes,
    selectedShapes,
    layers,
    activeLayerId,
    pages,
    activePageId,
    currentTool,
    currentStyles,
    textStyles,
    gridSize,
    gridOpacity,
    gridType,
    gridColor,
    showRulers,
    snapToGrid,
    showLayers,
    showShapeLibrary,
    shapeLibraryPosition,
    isDraggingShapeLibrary,
    dragOffsetShapeLibrary,
    showPageTabs,
    pageTabsPosition,
    isDraggingPageTabs,
    dragOffsetPageTabs,
    contextMenuPage,
    contextMenuPosition,
    showRenameDialog,
    renameData,
    showAddPageDialog,
    showPageManagerDialog,
    showCalculator,
    calculatorPosition,
    showColorPicker,
    colorPickerPosition,
    showPartPropertiesDialog,
    partPropertiesData,
    pendingShapeData,
    draggedShapeData,
    showBOMGenerator,
    bomGeneratorPosition,
    showKeyboardShortcuts,
    history,
    historyIndex,
    autoSaveEnabled,
    autoSaveInterval,
    autoSaveTimer,
    lastAutoSave,
    autoSaveStatus,
    autoSaveMessage,
    localStorageKey,
    documentName,
    documentModified,
    showSplashScreen,
    appVersion,
    licenseNumber,
    clipboard,
    activeTab,
    isGlossy,
    shapeLibraries,
    libraryShapes,

    // Computed
    activePage,
    activeLayer,
    selectedLayerIndex,
    visibleLayers,
    selectedShapesObjects,
    canvasWidth,
    canvasHeight,
    visibleShapes,

    // Actions
    initializeApp,
    initializeGlossyPreference,
    toggleGlossy,
    applyGlossyEffect,
    removeGlossyEffect,
    initializeDefaultPage,
    addShape,
    updateShape,
    deleteShapes,
    selectShapes,
    addLayer,
    updateLayers,
    deleteLayer,
    moveLayer,
    duplicateLayer,
    mergeLayerDown,
    clearLayer,
    renameLayer,
    updateLayerOpacity,
    toggleLayerVisibility,
    toggleLayerFreeze,
    addPage,
    updatePage,
    movePage,
    deletePage,
    setActivePage,
    renamePage,
    togglePageType,
    duplicatePage,
    getPageShapes,
    setTool,
    updateStyles,
    toggleGrid,
    updateGridSettings,
    toggleRulers,
    toggleSnapToGrid,
    toggleLayersPanel,
    toggleShapeLibrary,
    startDragShapeLibrary,
    dragShapeLibrary,
    endDragShapeLibrary,
    togglePageTabs,
    startDragPageTabs,
    dragPageTabs,
    endDragPageTabs,
    showPageContextMenu,
    closeContextMenu,
    toggleCalculator,
    toggleColorPicker,
    applySelectedColor,
    togglePartPropertiesDialog,
    applyPartProperties,
    toggleBOMGenerator,
    toggleKeyboardShortcuts,
    handleShapeDragStart,
    handleAddShape,
    handleCanvasDrop,
    createShapeFromLibrary,
    addLibraryShape,
    clearCanvas,
    openFile,
    saveFile,
    saveFileAs,
    exportAsPDF,
    exportAsPNG,
    exportAsSVG,
    exportAsJSON,
    importFile,
    getAllShapes,
    saveToHistory,
    undo,
    redo,
    initAutoSave,
    performAutoSave,
    loadAutoSavedData,
    restoreAutoSavedData,
    cutShapes,
    copyShapes,
    pasteShapes,
    setActiveTab,
    toggleSplashScreen,
  };
});