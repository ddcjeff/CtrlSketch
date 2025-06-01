import React, { useState } from 'react';
import './MultiPageTabs.css';

/**
 * MultiPageTabs component for displaying and managing document pages
 * @param {Object} props - Component props
 * @param {Array} props.pages - Array of page objects
 * @param {Array} props.pageOrder - Array of page IDs in display order
 * @param {string|number} props.currentPageId - ID of the currently active page
 * @param {Function} props.onChangePage - Callback when page is changed
 * @param {Function} props.onAddPage - Callback when new page is added
 * @param {Function} props.onRemovePage - Callback when page is removed
 * @param {Function} props.onReorderPages - Callback when pages are reordered
 * @returns {JSX.Element} Rendered component
 */
const MultiPageTabs = ({
  pages = [],
  pageOrder = [],
  currentPageId,
  onChangePage,
  onAddPage,
  onRemovePage,
  onReorderPages
}) => {
  const [newPageName, setNewPageName] = useState('');
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState(null);

  // If no page order is provided, use the pages array order
  const effectivePageOrder = pageOrder.length > 0 
    ? pageOrder 
    : pages.map(page => page.id);

  // Get ordered pages based on pageOrder
  const orderedPages = effectivePageOrder
    .map(id => pages.find(page => page.id === id))
    .filter(Boolean);

  const handleAddPageClick = () => {
    setIsAddingPage(true);
  };

  const handleAddPageSubmit = (e) => {
    e.preventDefault();
    if (newPageName.trim()) {
      onAddPage(newPageName.trim());
      setNewPageName('');
      setIsAddingPage(false);
    }
  };

  const handleAddPageCancel = () => {
    setNewPageName('');
    setIsAddingPage(false);
  };

  const handlePageClick = (pageId) => {
    if (pageId !== currentPageId) {
      onChangePage(pageId);
    }
  };

  const handleRemovePage = (e, pageId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this page?')) {
      onRemovePage(pageId);
    }
  };

  // Drag and drop functionality for reordering tabs
  const handleDragStart = (e, pageId) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
    // For Firefox compatibility
    e.dataTransfer.setData('text/plain', pageId);
  };

  const handleDragOver = (e, pageId) => {
    e.preventDefault();
    if (draggedPageId && draggedPageId !== pageId) {
      // Find the drag target
      const dragTarget = e.currentTarget;
      dragTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetPageId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedPageId && draggedPageId !== targetPageId) {
      const newOrder = [...effectivePageOrder];
      const draggedIndex = newOrder.indexOf(draggedPageId);
      const targetIndex = newOrder.indexOf(targetPageId);
      
      // Remove the dragged item
      newOrder.splice(draggedIndex, 1);
      // Insert at the target position
      newOrder.splice(targetIndex, 0, draggedPageId);
      
      onReorderPages(newOrder);
    }
    setDraggedPageId(null);
  };

  const handleDragEnd = () => {
    setDraggedPageId(null);
    // Clean up any remaining drag-over styles
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  };

  return (
    <div className="multi-page-tabs">
      <div className="tabs-container">
        {orderedPages.map(page => (
          <div
            key={page.id}
            className={`tab ${page.id === currentPageId ? 'active' : ''} ${
              draggedPageId === page.id ? 'dragging' : ''
            }`}
            onClick={() => handlePageClick(page.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, page.id)}
            onDragOver={(e) => handleDragOver(e, page.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, page.id)}
            onDragEnd={handleDragEnd}
          >
            <span className="tab-name">{page.name}</span>
            {pages.length > 1 && (
              <button
                className="remove-tab"
                onClick={(e) => handleRemovePage(e, page.id)}
                title="Remove Page"
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        {isAddingPage ? (
          <form className="add-page-form" onSubmit={handleAddPageSubmit}>
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Page name"
              autoFocus
            />
            <button type="submit">Add</button>
            <button type="button" onClick={handleAddPageCancel}>Cancel</button>
          </form>
        ) : (
          <button className="add-tab-button" onClick={handleAddPageClick} title="Add Page">
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiPageTabs;