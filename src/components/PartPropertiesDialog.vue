<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-4 w-96 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-white text-lg font-medium">Assign Part Properties</h3>
        <button @click="openPartSelector" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
          Browse Database
        </button>
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Part Name</label>
        <input 
          type="text" 
          v-model="localProperties.name" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Haystack Tag</label>
        <textarea 
          v-model="localProperties.haystackTag" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          rows="2"
          placeholder="e.g. {id:HD3XMSTN, equip:true, hvac:true}"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          Enter Haystack tags in JSON format or as a simple string
        </div>
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Part Number</label>
        <input 
          type="text" 
          v-model="localProperties.partNumber" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Manufacturer</label>
        <input 
          type="text" 
          v-model="localProperties.manufacturer" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Quantity</label>
        <input 
          type="number" 
          v-model.number="localProperties.quantity" 
          min="1"
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Description</label>
        <textarea 
          v-model="localProperties.description" 
          rows="3"
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        ></textarea>
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Point Type</label>
        <select 
          v-model="localProperties.pointType" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        >
          <option value="">Select Point Type</option>
          <option value="AI">AI - Analog Input</option>
          <option value="BI">BI - Binary Input</option>
          <option value="AO">AO - Analog Output</option>
          <option value="BO">BO - Binary Output</option>
          <option value="UI">UI - Universal Input</option>
          <option value="UO">UO - Universal Output</option>
        </select>
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-400 text-sm mb-1">PDF Cut Sheet Path</label>
        <div class="flex">
          <input 
            type="text" 
            v-model="localProperties.pdfPath" 
            class="flex-1 bg-gray-700 text-white rounded-l-md border border-gray-600 px-3 py-2"
            readonly
          />
          <button @click="browsePdf" class="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-r-md">
            Browse
          </button>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button @click="cancel" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
          Cancel
        </button>
        <button @click="confirm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          Apply
        </button>
      </div>
    </div>
    
    <input 
      type="file" 
      ref="pdfInput" 
      style="display: none" 
      accept=".pdf"
      @change="handlePdfSelect"
    />
    
    <!-- Part Selector Dialog -->
    <PartSelector 
      v-if="showPartSelector" 
      @close="showPartSelector = false"
      @select="selectPartFromDatabase"
    />
  </div>
</template>

<script>
import PartSelector from './PartSelector.vue';

export default {
  name: 'PartPropertiesDialog',
  components: {
    PartSelector
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialProperties: {
      type: Object,
      default: () => ({
        name: '',
        haystackTag: '',
        partNumber: '',
        manufacturer: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      })
    }
  },
  data() {
    return {
      localProperties: {
        name: '',
        haystackTag: '',
        partNumber: '',
        manufacturer: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      },
      showPartSelector: false
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Initialize with provided properties
        console.log('PartPropertiesDialog show changed to true, initialProperties:', this.initialProperties);
        
        try {
          // Create a deep copy with default values for missing properties
          const props = JSON.parse(JSON.stringify(this.initialProperties || {}));
          
          // Log the properties for debugging
          console.log('Properties after JSON parse in show watcher:', props);
          
          // Check if we have a direct database part object with PascalCase properties
          if (props.PartNumber || props.Description || props.Manufacturer || props.ItemNumber) {
            console.log('PartPropertiesDialog show watcher detected database part object format');
            
            this.localProperties = {
              name: props.Description || props.name || '',
              haystackTag: props.haystackTag || `{id:${props.ItemNumber || 'unknown'}, ${(props.Class || 'part').toLowerCase()}:true}`,
              partNumber: props.PartNumber || props.partNumber || '',
              manufacturer: props.Manufacturer || props.manufacturer || '',
              quantity: typeof props.quantity === 'number' ? props.quantity : 1,
              description: props.description || `${props.Class || ''} - ${props.SubClass || ''}`,
              pointType: props.pointType || '',
              pdfPath: props.ProductCut || props.pdfPath || ''
            };
          } 
          // Check if we have an _originalPart property
          else if (props._originalPart) {
            console.log('PartPropertiesDialog show watcher detected _originalPart property:', props._originalPart);
            
            const originalPart = props._originalPart;
            
            this.localProperties = {
              name: originalPart.Description || originalPart.name || '',
              haystackTag: originalPart.haystackTag || `{id:${originalPart.ItemNumber || 'unknown'}, ${(originalPart.Class || 'part').toLowerCase()}:true}`,
              partNumber: originalPart.PartNumber || originalPart.partNumber || '',
              manufacturer: originalPart.Manufacturer || originalPart.manufacturer || '',
              quantity: typeof originalPart.quantity === 'number' ? originalPart.quantity : 1,
              description: originalPart.description || `${originalPart.Class || ''} - ${originalPart.SubClass || ''}`,
              pointType: originalPart.pointType || '',
              pdfPath: originalPart.ProductCut || originalPart.pdfPath || ''
            };
          }
          // Standard format with camelCase properties
          else {
            this.localProperties = {
              name: props.name || '',
              haystackTag: props.haystackTag || '',
              partNumber: props.partNumber || '',
              manufacturer: props.manufacturer || '',
              quantity: props.quantity || 1,
              description: props.description || '',
              pointType: props.pointType || '',
              pdfPath: props.pdfPath || ''
            };
          }
          
          // Format the Haystack tag if it's an object
          if (typeof this.localProperties.haystackTag === 'object') {
            try {
              // Convert to a formatted JSON string
              this.localProperties.haystackTag = JSON.stringify(this.localProperties.haystackTag, null, 2);
            } catch (e) {
              console.warn('Error formatting Haystack tag:', e);
              this.localProperties.haystackTag = '';
            }
          }
          
          console.log('PartPropertiesDialog opened with properties:', this.localProperties);
        } catch (error) {
          console.error('Error initializing properties:', error);
          // Set default values if there's an error
          this.localProperties = {
            name: '',
            haystackTag: '',
            partNumber: '',
            manufacturer: '',
            quantity: 1,
            description: '',
            pointType: '',
            pdfPath: ''
          };
        }
      }
    },
    initialProperties: {
      handler(newVal) {
        if (this.show && newVal) {
          console.log('PartPropertiesDialog initialProperties changed:', newVal);
          
          try {
            // Create a deep copy with default values for missing properties
            const props = JSON.parse(JSON.stringify(newVal || {}));
            
            // Log the properties for debugging
            console.log('Properties after JSON parse in initialProperties watcher:', props);
            
            // Check if we have a direct database part object with PascalCase properties
            if (props.PartNumber || props.Description || props.Manufacturer || props.ItemNumber) {
              console.log('PartPropertiesDialog detected database part object format');
              
              this.localProperties = {
                name: props.Description || props.name || '',
                haystackTag: props.haystackTag || `{id:${props.ItemNumber || 'unknown'}, ${(props.Class || 'part').toLowerCase()}:true}`,
                partNumber: props.PartNumber || props.partNumber || '',
                manufacturer: props.Manufacturer || props.manufacturer || '',
                quantity: typeof props.quantity === 'number' ? props.quantity : 1,
                description: props.description || `${props.Class || ''} - ${props.SubClass || ''}`,
                pointType: props.pointType || '',
                pdfPath: props.ProductCut || props.pdfPath || ''
              };
            } 
            // Check if we have an _originalPart property
            else if (props._originalPart) {
              console.log('PartPropertiesDialog detected _originalPart property:', props._originalPart);
              
              const originalPart = props._originalPart;
              
              this.localProperties = {
                name: originalPart.Description || originalPart.name || '',
                haystackTag: originalPart.haystackTag || `{id:${originalPart.ItemNumber || 'unknown'}, ${(originalPart.Class || 'part').toLowerCase()}:true}`,
                partNumber: originalPart.PartNumber || originalPart.partNumber || '',
                manufacturer: originalPart.Manufacturer || originalPart.manufacturer || '',
                quantity: typeof originalPart.quantity === 'number' ? originalPart.quantity : 1,
                description: originalPart.description || `${originalPart.Class || ''} - ${originalPart.SubClass || ''}`,
                pointType: originalPart.pointType || '',
                pdfPath: originalPart.ProductCut || originalPart.pdfPath || ''
              };
            }
            // Standard format with camelCase properties
            else {
              this.localProperties = {
                name: props.name || '',
                haystackTag: props.haystackTag || '',
                partNumber: props.partNumber || '',
                manufacturer: props.manufacturer || '',
                quantity: props.quantity || 1,
                description: props.description || '',
                pointType: props.pointType || '',
                pdfPath: props.pdfPath || ''
              };
            }
            
            // Format the Haystack tag if it's an object
            if (typeof this.localProperties.haystackTag === 'object') {
              try {
                // Convert to a formatted JSON string
                this.localProperties.haystackTag = JSON.stringify(this.localProperties.haystackTag, null, 2);
              } catch (e) {
                console.warn('Error formatting Haystack tag:', e);
                this.localProperties.haystackTag = '';
              }
            }
            
            console.log('PartPropertiesDialog initialProperties updated:', this.localProperties);
          } catch (error) {
            console.error('Error updating properties:', error);
          }
        }
      },
      deep: true
    }
  },
  methods: {
    browsePdf() {
      this.$refs.pdfInput.click();
    },
    
    handlePdfSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // In a real app, you'd upload this file to a server
      // For now, we'll just store the filename
      this.localProperties.pdfPath = file.name;
      
      // Reset the input
      event.target.value = '';
    },
    
    openPartSelector() {
      this.showPartSelector = true;
    },
    
    selectPartFromDatabase(partProperties) {
      console.log('Selected part from database:', partProperties);
      
      try {
        // Make a deep copy of the part properties
        const properties = JSON.parse(JSON.stringify(partProperties || {}));
        
        // Log the properties for debugging
        console.log('Properties after JSON parse:', JSON.stringify(properties, null, 2));
        
        // Check if we have a direct database part object with PascalCase properties
        if (properties.PartNumber || properties.Description || properties.Manufacturer || properties.ItemNumber) {
          console.log('selectPartFromDatabase detected database part object format with PascalCase properties');
          
          // Create a properly formatted part properties object
          const formattedProperties = {
            name: properties.Description || properties.name || 'Unnamed Part',
            haystackTag: properties.haystackTag || `{id:${properties.ItemNumber || 'unknown'}, ${(properties.Class || 'part').toLowerCase()}:true}`,
            partNumber: properties.PartNumber || properties.partNumber || '',
            manufacturer: properties.Manufacturer || properties.manufacturer || '',
            quantity: typeof properties.quantity === 'number' ? properties.quantity : 1,
            description: properties.description || `${properties.Class || ''} - ${properties.SubClass || ''}`,
            pointType: properties.pointType || '',
            pdfPath: properties.ProductCut || properties.pdfPath || '',
            
            // Preserve the original part data
            _originalPart: properties
          };
          
          // Format the Haystack tag if it's an object
          if (typeof formattedProperties.haystackTag === 'object') {
            try {
              // Convert to a formatted JSON string
              formattedProperties.haystackTag = JSON.stringify(formattedProperties.haystackTag, null, 2);
            } catch (e) {
              console.warn('Error formatting Haystack tag:', e);
              formattedProperties.haystackTag = '';
            }
          }
          
          console.log('Processed database part properties:', JSON.stringify(formattedProperties, null, 2));
          
          // Update local properties with the formatted properties
          this.localProperties = { ...formattedProperties };
        }
        // Check if we have an _originalPart property
        else if (properties._originalPart) {
          console.log('selectPartFromDatabase detected _originalPart property:', JSON.stringify(properties._originalPart, null, 2));
          
          const originalPart = properties._originalPart;
          
          // Create a properly formatted part properties object from the original part
          const formattedProperties = {
            name: originalPart.Description || originalPart.name || 'Unnamed Part',
            haystackTag: originalPart.haystackTag || `{id:${originalPart.ItemNumber || 'unknown'}, ${(originalPart.Class || 'part').toLowerCase()}:true}`,
            partNumber: originalPart.PartNumber || originalPart.partNumber || '',
            manufacturer: originalPart.Manufacturer || originalPart.manufacturer || '',
            quantity: typeof originalPart.quantity === 'number' ? originalPart.quantity : 1,
            description: originalPart.description || `${originalPart.Class || ''} - ${originalPart.SubClass || ''}`,
            pointType: originalPart.pointType || '',
            pdfPath: originalPart.ProductCut || originalPart.pdfPath || '',
            
            // Preserve the original part data
            _originalPart: originalPart
          };
          
          // Format the Haystack tag if it's an object
          if (typeof formattedProperties.haystackTag === 'object') {
            try {
              // Convert to a formatted JSON string
              formattedProperties.haystackTag = JSON.stringify(formattedProperties.haystackTag, null, 2);
            } catch (e) {
              console.warn('Error formatting Haystack tag:', e);
              formattedProperties.haystackTag = '';
            }
          }
          
          console.log('Processed original part properties:', JSON.stringify(formattedProperties, null, 2));
          
          // Update local properties with the formatted properties
          this.localProperties = { ...formattedProperties };
        }
        // Standard format with camelCase properties
        else {
          console.log('selectPartFromDatabase detected standard part object format with camelCase properties');
          
          // Create a properly formatted part properties object
          const formattedProperties = {
            name: properties.name || properties.Description || 'Unnamed Part',
            haystackTag: properties.haystackTag || '',
            partNumber: properties.partNumber || properties.PartNumber || '',
            manufacturer: properties.manufacturer || properties.Manufacturer || '',
            quantity: typeof properties.quantity === 'number' ? properties.quantity : 1,
            description: properties.description || properties.Description || '',
            pointType: properties.pointType || '',
            pdfPath: properties.pdfPath || properties.ProductCut || '',
            
            // Preserve the original part data
            _originalPart: properties
          };
          
          // Format the Haystack tag if it's an object
          if (typeof formattedProperties.haystackTag === 'object') {
            try {
              // Convert to a formatted JSON string
              formattedProperties.haystackTag = JSON.stringify(formattedProperties.haystackTag, null, 2);
            } catch (e) {
              console.warn('Error formatting Haystack tag:', e);
              formattedProperties.haystackTag = '';
            }
          }
          
          console.log('Processed standard part properties:', JSON.stringify(formattedProperties, null, 2));
          
          // Update local properties with the formatted properties
          this.localProperties = { ...formattedProperties };
        }
        
        // Force a UI update
        this.$nextTick(() => {
          console.log('UI updated with new properties:', this.localProperties);
          
          // Add additional debugging to verify the properties are set correctly
          console.log('Local properties after nextTick:', JSON.stringify(this.localProperties, null, 2));
        });
        
        this.showPartSelector = false;
      } catch (error) {
        console.error('Error processing part from database:', error);
        
        // Set default values if there's an error
        this.localProperties = {
          name: 'Unnamed Part',
          haystackTag: '',
          partNumber: '',
          manufacturer: '',
          quantity: 1,
          description: '',
          pointType: '',
          pdfPath: '',
          _originalPart: partProperties || {} // Still preserve the original properties
        };
      }
    },
    
    cancel() {
      this.$emit('cancel');
    },
    
    confirm() {
      try {
        // Create a deep copy of the properties to ensure they're not modified by reference
        const properties = JSON.parse(JSON.stringify(this.localProperties));
        console.log('Confirming part properties:', properties);
        
        // Ensure all required properties are present
        if (!properties.name) properties.name = 'Unnamed Part';
        if (!properties.quantity) properties.quantity = 1;
        
        // Emit the confirm event with the properties
        this.$emit('confirm', properties);
        
        // Log success message
        console.log('Part properties confirmed and emitted');
      } catch (error) {
        console.error('Error confirming part properties:', error);
      }
    }
  }
};
</script>