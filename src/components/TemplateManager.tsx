import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categoryColors, getRandomColor } from '../utils/colors';
import type { Category } from '../types';

interface TemplateManagerProps {
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose }) => {
  const { state, createTemplate, deleteTemplate, createTemplateFromSheet } = useApp();
  const [view, setView] = useState<'list' | 'create' | 'fromSheet'>('list');
  const [templateName, setTemplateName] = useState('');
  const [categories, setCategories] = useState<Omit<Category, 'id'>[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('0');
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor());
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [saveAsTemplateName, setSaveAsTemplateName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, {
        name: newCategoryName.trim(),
        amount: parseFloat(newCategoryAmount) || 0,
        color: newCategoryColor,
      }]);
      setNewCategoryName('');
      setNewCategoryAmount('0');
      setNewCategoryColor(getRandomColor());
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = () => {
    if (templateName.trim() && categories.length > 0) {
      createTemplate(templateName.trim(), categories);
      setTemplateName('');
      setCategories([]);
      setView('list');
    }
  };

  const handleSaveSheetAsTemplate = () => {
    if (selectedSheetId && saveAsTemplateName.trim()) {
      createTemplateFromSheet(saveAsTemplateName.trim(), selectedSheetId);
      setSelectedSheetId('');
      setSaveAsTemplateName('');
      setView('list');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Templates</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        {view === 'list' && (
          <>
            <div className="template-actions">
              <button className="btn btn-primary" onClick={() => setView('create')}>
                Create New Template
              </button>
              <button className="btn btn-secondary" onClick={() => setView('fromSheet')}>
                Save Sheet as Template
              </button>
            </div>

            <div className="template-list">
              {state.templates.length === 0 ? (
                <p className="empty-message">No templates yet. Create one to get started!</p>
              ) : (
                state.templates.map((template) => (
                  <div key={template.id} className="template-item">
                    <div className="template-info">
                      <h3>{template.name}</h3>
                      <p>{template.categories.length} categories</p>
                      <div className="template-categories">
                        {template.categories.map((cat, i) => (
                          <span key={i} className="category-tag" style={{ backgroundColor: cat.color }}>
                            {cat.name}: ${cat.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="template-create">
            <input
              type="text"
              className="input"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />

            <div className="categories-list">
              {categories.map((cat, index) => (
                <div key={index} className="category-item" style={{ borderLeftColor: cat.color }}>
                  <span>{cat.name}: ${cat.amount}</span>
                  <button className="btn-icon" onClick={() => handleRemoveCategory(index)}>&times;</button>
                </div>
              ))}
            </div>

            <div className="add-category-inline">
              <input
                type="text"
                className="input"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <input
                type="number"
                className="input input-small"
                placeholder="Amount"
                value={newCategoryAmount}
                onChange={(e) => setNewCategoryAmount(e.target.value)}
                step="0.01"
              />
              <div className="color-picker-inline">
                {categoryColors.slice(0, 8).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option-small ${newCategoryColor === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewCategoryColor(c)}
                  />
                ))}
              </div>
              <button className="btn btn-secondary" onClick={handleAddCategory}>Add</button>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateTemplate}
                disabled={!templateName.trim() || categories.length === 0}
              >
                Create Template
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setView('list');
                setTemplateName('');
                setCategories([]);
              }}>Back</button>
            </div>
          </div>
        )}

        {view === 'fromSheet' && (
          <div className="template-from-sheet">
            <select
              className="input"
              value={selectedSheetId}
              onChange={(e) => setSelectedSheetId(e.target.value)}
            >
              <option value="">Select a sheet...</option>
              {state.sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
              ))}
            </select>

            {selectedSheetId && (
              <input
                type="text"
                className="input"
                placeholder="Template name"
                value={saveAsTemplateName}
                onChange={(e) => setSaveAsTemplateName(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSaveSheetAsTemplate}
                disabled={!selectedSheetId || !saveAsTemplateName.trim()}
              >
                Save as Template
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setView('list');
                setSelectedSheetId('');
                setSaveAsTemplateName('');
              }}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
