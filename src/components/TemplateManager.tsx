import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { categoryColors, getRandomColor } from '../utils/colors';
import type { Category, Mark, Currency } from '../types';

// Format amount - ARS uses k for thousands, USD uses full decimals
const formatAmount = (amount: number, currency: Currency): string => {
  if (currency === 'ARS') {
    if (Math.abs(amount) >= 1000) {
      const k = amount / 1000;
      const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
      return `ARS $${formatted}k`;
    }
    return `ARS $${amount.toFixed(0)}`;
  }
  return `$${amount.toFixed(2)}`;
};

interface TemplateManagerProps {
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose }) => {
  const { state, createTemplate, deleteTemplate, createTemplateFromSheet } = useApp();
  const { t } = useSettings();
  const [view, setView] = useState<'list' | 'create' | 'fromSheet'>('list');
  const [templateName, setTemplateName] = useState('');
  const [categories, setCategories] = useState<Omit<Category, 'id'>[]>([]);
  const [marks, setMarks] = useState<Omit<Mark, 'id' | 'completed' | 'completedAt'>[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('0');
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor());
  const [newMarkName, setNewMarkName] = useState('');
  const [newMarkAmount, setNewMarkAmount] = useState('0');
  const [newMarkType, setNewMarkType] = useState<'incoming' | 'outgoing'>('incoming');
  const [newMarkCurrency, setNewMarkCurrency] = useState<Currency>('USD');
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [saveAsTemplateName, setSaveAsTemplateName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, {
        name: newCategoryName.trim(),
        amount: parseFloat(newCategoryAmount) || 0,
        color: newCategoryColor,
        currency: 'USD',
      }]);
      setNewCategoryName('');
      setNewCategoryAmount('0');
      setNewCategoryColor(getRandomColor());
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleAddMark = () => {
    if (newMarkName.trim()) {
      setMarks([...marks, {
        name: newMarkName.trim(),
        amount: parseFloat(newMarkAmount) || 0,
        type: newMarkType,
        currency: newMarkCurrency,
      }]);
      setNewMarkName('');
      setNewMarkAmount('0');
      setNewMarkCurrency('USD');
    }
  };

  const handleRemoveMark = (index: number) => {
    setMarks(marks.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = () => {
    if (templateName.trim() && (categories.length > 0 || marks.length > 0)) {
      createTemplate(templateName.trim(), categories, marks);
      setTemplateName('');
      setCategories([]);
      setMarks([]);
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
          <h2>{t('templates')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        {view === 'list' && (
          <>
            <div className="template-actions">
              <button className="btn btn-primary" onClick={() => setView('create')}>
                {t('createNewTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={() => setView('fromSheet')}>
                {t('saveSheetAsTemplate')}
              </button>
            </div>

            <div className="template-list">
              {state.templates.length === 0 ? (
                <p className="empty-message">{t('noTemplatesMessage')}</p>
              ) : (
                state.templates.map((template) => (
                  <div key={template.id} className="template-item">
                    <div className="template-info">
                      <h3>{template.name}</h3>
                      <p>
                        {template.categories.length} {t('categories')}
                        {(template.marks?.length || 0) > 0 && `, ${template.marks?.length} ${t('transactionsCount')}`}
                      </p>
                      <div className="template-categories">
                        {template.categories.map((cat, i) => (
                          <span key={i} className="category-tag" style={{ backgroundColor: cat.color }}>
                            {cat.name}: ${cat.amount}
                          </span>
                        ))}
                      </div>
                      {template.marks && template.marks.length > 0 && (
                        <div className="template-marks">
                          {template.marks.map((mark, i) => (
                            <span key={i} className={`mark-tag ${mark.type}`}>
                              {mark.type === 'incoming' ? '+' : '-'} {mark.name}: {formatAmount(mark.amount, mark.currency || 'USD')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      {t('delete')}
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
              placeholder={t('templateName')}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />

            <div className="template-section">
              <h4>{t('categories')}</h4>
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
                  placeholder={t('categoryNamePlaceholder')}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
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
            </div>

            <div className="template-section">
              <h4>{t('transactions')}</h4>
              <div className="marks-template-list">
                {marks.map((mark, index) => (
                  <div key={index} className={`mark-template-item ${mark.type}`}>
                    <span className="mark-type-indicator">{mark.type === 'incoming' ? '+' : '-'}</span>
                    <span>{mark.name}: {formatAmount(mark.amount, mark.currency)}</span>
                    <button className="btn-icon" onClick={() => handleRemoveMark(index)}>&times;</button>
                  </div>
                ))}
              </div>

              <div className="add-mark-inline">
                <select
                  className="input input-small"
                  value={newMarkType}
                  onChange={(e) => setNewMarkType(e.target.value as 'incoming' | 'outgoing')}
                >
                  <option value="incoming">{t('incoming')}</option>
                  <option value="outgoing">{t('outgoing')}</option>
                </select>
                <input
                  type="text"
                  className="input"
                  placeholder={t('transactionNamePlaceholder')}
                  value={newMarkName}
                  onChange={(e) => setNewMarkName(e.target.value)}
                />
                <input
                  type="number"
                  className="input input-small"
                  placeholder={t('amount')}
                  value={newMarkAmount}
                  onChange={(e) => setNewMarkAmount(e.target.value)}
                  step="0.01"
                />
                <select
                  className="input currency-select"
                  value={newMarkCurrency}
                  onChange={(e) => setNewMarkCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
                <button className="btn btn-secondary" onClick={handleAddMark}>{t('add')}</button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateTemplate}
                disabled={!templateName.trim() || (categories.length === 0 && marks.length === 0)}
              >
                {t('createTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setView('list');
                setTemplateName('');
                setCategories([]);
                setMarks([]);
              }}>{t('back')}</button>
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
              <option value="">{t('selectSheetOption')}</option>
              {state.sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
              ))}
            </select>

            {selectedSheetId && (
              <>
                <input
                  type="text"
                  className="input"
                  placeholder={t('templateName')}
                  value={saveAsTemplateName}
                  onChange={(e) => setSaveAsTemplateName(e.target.value)}
                />
                <p className="text-muted">
                  {t('templateSaveDescription')}
                </p>
              </>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSaveSheetAsTemplate}
                disabled={!selectedSheetId || !saveAsTemplateName.trim()}
              >
                {t('saveAsTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setView('list');
                setSelectedSheetId('');
                setSaveAsTemplateName('');
              }}>{t('back')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
