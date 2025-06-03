import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PartsPlus.css';
import PartFormModal from './PartFormModal';

const PartsPlus = () => {
  const [parts, setParts] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [subclassFilter, setSubclassFilter] = useState('');
  const [filteredParts, setFilteredParts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentPart, setCurrentPart] = useState({
    ItemNumber: '',
    PartNumber: '',
    Manufacturer: '',
    Supplier: '',
    Class: '',
    SubClass: '',
    ListPrice: '',
    Discount: '',
    CostPrice: '',
    Description: '',
    ProductCut: ''
  });

  // Sample data for development
  const sampleParts = [
    {
      ItemNumber: '98950',
      PartNumber: 'F-1200',
      Manufacturer: 'ONICON',
      Supplier: 'ALPS',
      Class: 'FLOW',
      SubClass: 'SINGLE TURBINE',
      ListPrice: '50',
      Discount: '1',
      CostPrice: '50',
      Description: '',
      ProductCut: 'C:\\Work\\CutSheets\\F-1200-Catalog-Sheet.pdf'
    }
  ];

  const fetchParts = () => {
    try {
      console.log('Fetching parts data...');
      // In a real application, this would call your API
      // For now, we'll use our sample data
      setParts(sampleParts || []);
      setFilteredParts(sampleParts || []); // Initialize filtered parts with empty array fallback
      setDataLoaded(true);
      console.log('Parts data loaded successfully');
    } catch (error) {
      console.error('Error fetching parts:', error);
      // Initialize with empty arrays on error
      setParts([]);
      setFilteredParts([]);
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);
  
  // Apply filters whenever the filter values or parts data changes
  useEffect(() => {
    // Extra error handling to prevent white screen issues
    try {
      // Guard clause with explicit array check
      if (!Array.isArray(parts) || parts.length === 0) {
        console.log('No parts data to filter');
        setFilteredParts([]);
        return;
      }
      
      let result = [...parts];
      
      if (classFilter) {
        result = result.filter(part => 
          part && part.Class && part.Class.toUpperCase() === classFilter.toUpperCase()
        );
      }
      
      if (subclassFilter) {
        result = result.filter(part => 
          part && part.SubClass && part.SubClass.toUpperCase() === subclassFilter.toUpperCase()
        );
      }
      
      setFilteredParts(result);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Recover gracefully from any errors
      setFilteredParts([]);
    }
  }, [parts, classFilter, subclassFilter]);

  const handleSave = (part) => {
    try {
      // In a real application, this would call your API
      console.log('Saving part:', part);
      
      if (!part) {
        console.error('Cannot save null or undefined part');
        return;
      }
      
      // Simulating API call success
      if (part.ItemNumber) {
        // Update existing part with null check for parts array
        if (Array.isArray(parts)) {
          setParts(parts.map(p => p && p.ItemNumber === part.ItemNumber ? part : p));
        } else {
          console.error('parts is not an array in handleSave');
          setParts([part]); // Initialize with this part if parts isn't an array
        }
      } else {
        // Add new part with a generated ID
        const newPart = {
          ...part,
          ItemNumber: Math.floor(Math.random() * 100000).toString()
        };
        
        // Ensure parts is treated as an array
        setParts(Array.isArray(parts) ? [...parts, newPart] : [newPart]);
      }
      
      setModalOpen(false);
      setEditPart(null);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving part:', error);
      // Show error to user
      alert('Error saving part. Please try again.');
    }
  };

  const handleDelete = (id) => {
    try {
      if (!id) {
        console.error('Cannot delete part with null or undefined ID');
        return;
      }
      
      if (!window.confirm(`Delete part ${id}?`)) return;
      
      // In a real application, this would call your API
      // Add null checks to prevent white screen issues
      if (Array.isArray(parts)) {
        setParts(parts.filter(p => p && p.ItemNumber !== id));
      } else {
        console.error('parts is not an array in handleDelete');
      }
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Error deleting part. Please try again.');
    }
  };

  const handleEditPartField = (e) => {
    const { name, value } = e.target;
    setCurrentPart(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPartSubmit = () => {
    handleSave(currentPart);
    setEditMode(false);
  };

  // Even more robust null checks before using map to prevent errors
  // These prevent the TypeError: Cannot read properties of undefined (reading 'map') error
  const classOptions = Array.isArray(parts) && parts.length > 0
    ? [...new Set(parts.filter(Boolean).map(p => (p && p.Class) || '').filter(Boolean))] 
    : [];
  
  const subclassOptions = Array.isArray(parts) && parts.length > 0
    ? [...new Set(parts.filter(Boolean).map(p => (p && p.SubClass) || '').filter(Boolean))] 
    : [];

  return (
    <div className="parts-plus">
      <div className="header">
        <div className="title">Parts Plus</div>
        <div className="menu-tabs">
          <button className="tab active">Class</button>
          <button className="tab">SubClass</button>
          <button className="tab">DB settings</button>
          <button className="tab">BOM Editor</button>
          <button className="tab">?</button>
        </div>
        <div className="window-controls">
          <button className="minimize">-</button>
          <button className="maximize">□</button>
          <button className="close">×</button>
        </div>
      </div>

      <div className="parts-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ItemNumber</th>
              <th>PartNumber</th>
              <th>Manufacturer</th>
              <th>Supplier</th>
              <th>Class</th>
              <th>SubClass</th>
              <th>ListPrice</th>
              <th>Discount</th>
              <th>CostPrice</th>
              <th>Description</th>
              <th>ProductCut</th>
            </tr>
          </thead>
          <tbody>
            {!filteredParts || filteredParts.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                  No parts found matching the selected filters.
                </td>
              </tr>
            ) : (
              Array.isArray(filteredParts) ? filteredParts.map(part => {
                return part ? (
                  <tr key={part.ItemNumber || Math.random()} className={currentPart.ItemNumber === part.ItemNumber ? 'selected' : ''} 
                      onClick={() => {
                        setCurrentPart(part);
                        setEditMode(true);
                      }}>
                    <td>
                      <div className="expand-icon">▶</div>
                    </td>
                    <td>{part.ItemNumber || '-'}</td>
                    <td>{part.PartNumber || '-'}</td>
                    <td>{part.Manufacturer || '-'}</td>
                    <td>{part.Supplier || '-'}</td>
                    <td>{part.Class || '-'}</td>
                    <td>{part.SubClass || '-'}</td>
                    <td>{part.ListPrice || '-'}</td>
                    <td>{part.Discount || '-'}</td>
                    <td>{part.CostPrice || '-'}</td>
                    <td>{part.Description || '-'}</td>
                    <td>{part.ProductCut || '-'}</td>
                  </tr>
                ) : null;
              }) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                    Error loading parts data. Please try refreshing the page.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <div className="filtered-count">
          Showing {filteredParts?.length || 0} of {parts?.length || 0} parts
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Filter</div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Class</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">Select Class</option>
              {Array.isArray(classOptions) && classOptions.length > 0 
                ? classOptions.map(c => <option key={c || 'empty'} value={c || ''}>{c || ''}</option>)
                : null}
            </select>
          </div>
          <div className="filter-group">
            <label>SubClass</label>
            <select value={subclassFilter} onChange={(e) => setSubclassFilter(e.target.value)}>
              <option value="">Select SubClass</option>
              {Array.isArray(subclassOptions) && subclassOptions.length > 0 
                ? subclassOptions.map(s => <option key={s || 'empty'} value={s || ''}>{s || ''}</option>)
                : null}
            </select>
          </div>
          <button 
            className="reset-filters-btn"
            onClick={() => {
              setClassFilter('');
              setSubclassFilter('');
            }}
          >
            Reset Filters
          </button>
        </div>
        <div className="action-buttons">
          <button className="action-button" onClick={() => {
            setEditPart(null);
            setModalOpen(true);
          }}>Add Part</button>
          <button className="action-button" onClick={() => {
            setEditPart(currentPart);
            setModalOpen(true);
          }}>Update Part</button>
          <button className="action-button" onClick={() => handleDelete(currentPart.ItemNumber)}>Delete Part</button>
          <button className="action-button">Refresh</button>
          <button className="action-button">View PDF</button>
          <button className="action-button">Cancel</button>
        </div>
      </div>

      {editMode && (
        <div className="edit-part-form">
          <h3>Edit Part</h3>
          <div className="edit-form-grid">
            <div className="edit-form-group">
              <label>ItemNumber</label>
              <input 
                type="text" 
                name="ItemNumber" 
                value={currentPart.ItemNumber} 
                onChange={handleEditPartField}
                readOnly
              />
            </div>
            <div className="edit-form-group">
              <label>Class</label>
              <select 
                name="Class" 
                value={currentPart.Class} 
                onChange={handleEditPartField}
              >
                <option value="">Select Class</option>
                {Array.isArray(classOptions) && classOptions.length > 0 
                  ? classOptions.map(c => <option key={c || 'empty'} value={c || ''}>{c || ''}</option>)
                  : null}
              </select>
            </div>
            <div className="edit-form-group">
              <label>CostPrice</label>
              <input 
                type="text" 
                name="CostPrice" 
                value={currentPart.CostPrice} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>PartNumber</label>
              <input 
                type="text" 
                name="PartNumber" 
                value={currentPart.PartNumber} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>SubClass</label>
              <select 
                name="SubClass" 
                value={currentPart.SubClass} 
                onChange={handleEditPartField}
              >
                <option value="">Select SubClass</option>
                {Array.isArray(subclassOptions) && subclassOptions.length > 0 
                  ? subclassOptions.map(s => <option key={s || 'empty'} value={s || ''}>{s || ''}</option>)
                  : null}
              </select>
            </div>
            <div className="edit-form-group">
              <label>Description</label>
              <input 
                type="text" 
                name="Description" 
                value={currentPart.Description} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>Manufacturer</label>
              <input 
                type="text" 
                name="Manufacturer" 
                value={currentPart.Manufacturer} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>ListPrice</label>
              <input 
                type="text" 
                name="ListPrice" 
                value={currentPart.ListPrice} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>ProductCut</label>
              <div className="file-input-container">
                <input 
                  type="text" 
                  name="ProductCut" 
                  value={currentPart.ProductCut} 
                  onChange={handleEditPartField}
                />
                <button className="select-file-btn">Select</button>
              </div>
            </div>
            <div className="edit-form-group">
              <label>Supplier</label>
              <input 
                type="text" 
                name="Supplier" 
                value={currentPart.Supplier} 
                onChange={handleEditPartField}
              />
            </div>
            <div className="edit-form-group">
              <label>Discount</label>
              <input 
                type="text" 
                name="Discount" 
                value={currentPart.Discount} 
                onChange={handleEditPartField}
              />
            </div>
          </div>
        </div>
      )}

      <PartFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editPart}
      />
    </div>
  );
};

export default PartsPlus;