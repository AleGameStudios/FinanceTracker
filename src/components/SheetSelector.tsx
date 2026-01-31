import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface SheetSelectorProps {
  onNewSheet: () => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({ onNewSheet }) => {
  const { state, setActiveSheet, deleteSheet } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteSheet = (sheetId: string) => {
    deleteSheet(sheetId);
    setShowDeleteConfirm(null);
  };

  const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);

  return (
    <div className="sheet-selector">
      <div className="sheet-tabs">
        {state.sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`sheet-tab ${sheet.id === state.activeSheetId ? 'active' : ''}`}
          >
            <button
              className="sheet-tab-btn"
              onClick={() => setActiveSheet(sheet.id)}
            >
              {sheet.name}
            </button>
            {state.sheets.length > 1 && (
              <button
                className="btn-icon btn-delete-tab"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(sheet.id);
                }}
                title="Delete sheet"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-primary btn-new-sheet" onClick={onNewSheet}>
          + New Month
        </button>
      </div>

      {activeSheet && (
        <div className="sheet-info">
          <span className="sheet-date">
            Started: {new Date(activeSheet.createdAt).toLocaleDateString()}
          </span>
          <span className="sheet-total">
            Total: ${activeSheet.categories.reduce((sum, cat) => sum + cat.amount, 0).toFixed(2)}
          </span>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Sheet</h3>
            <p>Are you sure you want to delete this sheet? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => handleDeleteSheet(showDeleteConfirm)}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
