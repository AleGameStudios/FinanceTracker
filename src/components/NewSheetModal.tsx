import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { categoryColors, getRandomColor } from '../utils/colors';
import type { Category } from '../types';

interface NewSheetModalProps {
  onClose: () => void;
}

export const NewSheetModal: React.FC<NewSheetModalProps> = ({ onClose }) => {
  const { state, createSheet } = useApp();
  const { t } = useSettings();
  const [step, setStep] = useState<'name' | 'template' | 'custom'>('name');
  const [sheetName, setSheetName] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<Omit<Category, 'id'>[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('0');
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor());

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCustomCategories([...customCategories, {
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
    setCustomCategories(customCategories.filter((_, i) => i !== index));
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplateId && sheetName.trim()) {
      const template = state.templates.find(t => t.id === selectedTemplateId);
      if (template) {
        createSheet(sheetName.trim(), template.categories, template.marks || []);
        onClose();
      }
    }
  };

  const handleCreateCustom = () => {
    if (sheetName.trim() && customCategories.length > 0) {
      createSheet(sheetName.trim(), customCategories);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>{t('newSheetTitle')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        {step === 'name' && (
          <div className="step-content">
            <p>{t('sheetNameQuestion')}</p>
            <input
              type="text"
              className="input"
              placeholder={t('sheetNamePlaceholder')}
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setStep('template')}
                disabled={!sheetName.trim()}
              >
                {t('continue')}
              </button>
              <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="step-content">
            <p>{t('templateOrCustom')}</p>

            {state.templates.length > 0 && (
              <div className="template-selection">
                <h3>{t('useATemplate')}</h3>
                <div className="template-grid">
                  {state.templates.map((template) => (
                    <div
                      key={template.id}
                      className={`template-option ${selectedTemplateId === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <h4>{template.name}</h4>
                      <p>{template.categories.length} {t('categories')}</p>
                      <div className="template-preview">
                        {template.categories.slice(0, 3).map((cat, i) => (
                          <span key={i} className="category-dot" style={{ backgroundColor: cat.color }} />
                        ))}
                        {template.categories.length > 3 && <span>+{template.categories.length - 3}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              {selectedTemplateId && (
                <button className="btn btn-primary" onClick={handleCreateFromTemplate}>
                  {t('createFromTemplate')}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => {
                setSelectedTemplateId(null);
                setStep('custom');
              }}>
                {t('createCustomCategories')}
              </button>
              <button className="btn btn-secondary" onClick={() => setStep('name')}>{t('back')}</button>
            </div>
          </div>
        )}

        {step === 'custom' && (
          <div className="step-content">
            <h3>{t('createCategories')} "{sheetName}"</h3>

            <div className="categories-list">
              {customCategories.map((cat, index) => (
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
                placeholder={t('categoryNamePlaceholder')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <input
                type="number"
                className="input input-small"
                placeholder={t('amount')}
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
              <button className="btn btn-secondary" onClick={handleAddCategory}>{t('add')}</button>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateCustom}
                disabled={customCategories.length === 0}
              >
                {t('createSheet')}
              </button>
              <button className="btn btn-secondary" onClick={() => setStep('template')}>{t('back')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
