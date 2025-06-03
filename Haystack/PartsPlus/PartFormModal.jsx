import React, { useState, useEffect } from 'react';
import './PartForm.css';

const PartFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [part, setPart] = useState({
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

  // Default empty part object to prevent null/undefined errors
  const defaultPart = {
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
  };

  useEffect(() => {
    if (initialData) {
      // Use the spread operator with defaultPart to ensure all fields exist
      setPart({
        ...defaultPart,
        ...initialData
      });
    } else {
      setPart(defaultPart);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    if (!e || !e.target) return;
    
    const { name, value } = e.target;
    // Use the default part object as fallback if prev is somehow undefined
    setPart(prev => ({ ...(prev || defaultPart), [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(part);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Part' : 'Add New Part'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Item Number</label>
              <input
                type="text"
                name="ItemNumber"
                value={part?.ItemNumber || ''}
                onChange={handleChange}
                disabled={initialData}
              />
            </div>
            <div className="form-group">
              <label>Part Number</label>
              <input
                type="text"
                name="PartNumber"
                value={part.PartNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                name="Manufacturer"
                value={part.Manufacturer}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                name="Supplier"
                value={part.Supplier}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Class</label>
              <input
                type="text"
                name="Class"
                value={part.Class}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>SubClass</label>
              <input
                type="text"
                name="SubClass"
                value={part.SubClass}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>List Price</label>
              <input
                type="number"
                name="ListPrice"
                value={part.ListPrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Discount</label>
              <input
                type="number"
                name="Discount"
                value={part.Discount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Cost Price</label>
              <input
                type="number"
                name="CostPrice"
                value={part.CostPrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="Description"
                value={part.Description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Product Cut</label>
              <div className="file-input-container">
                <input
                  type="text"
                  name="ProductCut"
                  value={part.ProductCut}
                  onChange={handleChange}
                />
                <button type="button" className="select-file-btn">Select</button>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="save-button">Save</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartFormModal;