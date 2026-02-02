import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { categoryColors, getRandomColor } from '../utils/colors';
import type { Category, Currency, Balance } from '../types';

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

// Template mark type with index-based references
interface TemplateMark {
  name: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  currency: Currency;
  categoryIndex?: number;
  balanceIndex?: number;
  dueDate?: string;
}

interface TemplateManagerProps {
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose }) => {
  const { state, createTemplate, deleteTemplate, createTemplateFromSheet } = useApp();
  const { t } = useSettings();
  const [view, setView] = useState<'list' | 'create' | 'fromSheet'>('list');
  const [templateName, setTemplateName] = useState('');
  const [categories, setCategories] = useState<Omit<Category, 'id'>[]>([]);
  const [balances, setBalances] = useState<Omit<Balance, 'id'>[]>([]);
  const [marks, setMarks] = useState<TemplateMark[]>([]);

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('0');
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor());
  const [newCategoryCurrency, setNewCategoryCurrency] = useState<Currency>('USD');

  // Balance form state
  const [newBalanceName, setNewBalanceName] = useState('');
  const [newBalanceAmount, setNewBalanceAmount] = useState('0');
  const [newBalanceCurrency, setNewBalanceCurrency] = useState<Currency>('USD');

  // Mark form state
  const [newMarkName, setNewMarkName] = useState('');
  const [newMarkAmount, setNewMarkAmount] = useState('0');
  const [newMarkType, setNewMarkType] = useState<'incoming' | 'outgoing'>('incoming');
  const [newMarkCurrency, setNewMarkCurrency] = useState<Currency>('USD');
  const [newMarkCategoryIndex, setNewMarkCategoryIndex] = useState<number | undefined>(undefined);
  const [newMarkBalanceIndex, setNewMarkBalanceIndex] = useState<number | undefined>(undefined);
  const [newMarkDueDate, setNewMarkDueDate] = useState('');

  // From sheet state
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [saveAsTemplateName, setSaveAsTemplateName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, {
        name: newCategoryName.trim(),
        amount: parseFloat(newCategoryAmount) || 0,
        color: newCategoryColor,
        currency: newCategoryCurrency,
      }]);
      setNewCategoryName('');
      setNewCategoryAmount('0');
      setNewCategoryColor(getRandomColor());
      setNewCategoryCurrency('USD');
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    // Update marks that reference this category
    setMarks(marks.map(mark => ({
      ...mark,
      categoryIndex: mark.categoryIndex === index ? undefined :
        mark.categoryIndex !== undefined && mark.categoryIndex > index ? mark.categoryIndex - 1 : mark.categoryIndex
    })));
  };

  const handleAddBalance = () => {
    if (newBalanceName.trim()) {
      setBalances([...balances, {
        name: newBalanceName.trim(),
        amount: parseFloat(newBalanceAmount) || 0,
        currency: newBalanceCurrency,
      }]);
      setNewBalanceName('');
      setNewBalanceAmount('0');
      setNewBalanceCurrency('USD');
    }
  };

  const handleRemoveBalance = (index: number) => {
    setBalances(balances.filter((_, i) => i !== index));
    // Update marks that reference this balance
    setMarks(marks.map(mark => ({
      ...mark,
      balanceIndex: mark.balanceIndex === index ? undefined :
        mark.balanceIndex !== undefined && mark.balanceIndex > index ? mark.balanceIndex - 1 : mark.balanceIndex
    })));
  };

  const handleAddMark = () => {
    if (newMarkName.trim()) {
      setMarks([...marks, {
        name: newMarkName.trim(),
        amount: parseFloat(newMarkAmount) || 0,
        type: newMarkType,
        currency: newMarkCurrency,
        categoryIndex: newMarkCategoryIndex,
        balanceIndex: newMarkBalanceIndex,
        dueDate: newMarkDueDate || undefined,
      }]);
      setNewMarkName('');
      setNewMarkAmount('0');
      setNewMarkCurrency('USD');
      setNewMarkCategoryIndex(undefined);
      setNewMarkBalanceIndex(undefined);
      setNewMarkDueDate('');
    }
  };

  const handleRemoveMark = (index: number) => {
    setMarks(marks.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = () => {
    if (templateName.trim() && (categories.length > 0 || marks.length > 0 || balances.length > 0)) {
      // Convert template marks to the format expected by createTemplate
      const convertedMarks = marks.map(mark => ({
        name: mark.name,
        amount: mark.amount,
        type: mark.type,
        currency: mark.currency,
        categoryId: mark.categoryIndex !== undefined ? `idx:${mark.categoryIndex}` : undefined,
        balanceId: mark.balanceIndex !== undefined ? `idx:${mark.balanceIndex}` : undefined,
        dueDate: mark.dueDate,
      }));

      createTemplate(templateName.trim(), categories, convertedMarks, balances);
      resetForm();
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

  const resetForm = () => {
    setTemplateName('');
    setCategories([]);
    setBalances([]);
    setMarks([]);
    setNewCategoryName('');
    setNewCategoryAmount('0');
    setNewCategoryColor(getRandomColor());
    setNewCategoryCurrency('USD');
    setNewBalanceName('');
    setNewBalanceAmount('0');
    setNewBalanceCurrency('USD');
    setNewMarkName('');
    setNewMarkAmount('0');
    setNewMarkType('incoming');
    setNewMarkCurrency('USD');
    setNewMarkCategoryIndex(undefined);
    setNewMarkBalanceIndex(undefined);
    setNewMarkDueDate('');
  };

  // Helper to get linked category/balance names for display in template list
  const getLinkedCategoryNameFromTemplate = (mark: { categoryId?: string }, templateCategories: Omit<Category, 'id'>[]): string | null => {
    if (mark.categoryId?.startsWith('idx:')) {
      const idx = parseInt(mark.categoryId.slice(4), 10);
      return templateCategories[idx]?.name || null;
    }
    return null;
  };

  const getLinkedBalanceNameFromTemplate = (mark: { balanceId?: string }, templateBalances: Omit<Balance, 'id'>[]): string | null => {
    if (mark.balanceId?.startsWith('idx:')) {
      const idx = parseInt(mark.balanceId.slice(4), 10);
      return templateBalances[idx]?.name || null;
    }
    return null;
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
                        {(template.balances?.length || 0) > 0 && `, ${template.balances?.length} ${t('balancesCount')}`}
                        {(template.marks?.length || 0) > 0 && `, ${template.marks?.length} ${t('transactionsCount')}`}
                      </p>
                      <div className="template-categories">
                        {template.categories.map((cat, i) => (
                          <span key={i} className="category-tag" style={{ backgroundColor: cat.color }}>
                            {cat.name}: {formatAmount(cat.amount, cat.currency)}
                          </span>
                        ))}
                      </div>
                      {template.balances && template.balances.length > 0 && (
                        <div className="template-balances">
                          {template.balances.map((bal, i) => (
                            <span key={i} className="balance-tag">
                              💰 {bal.name}: {formatAmount(bal.amount, bal.currency)}
                            </span>
                          ))}
                        </div>
                      )}
                      {template.marks && template.marks.length > 0 && (
                        <div className="template-marks">
                          {template.marks.map((mark, i) => {
                            const linkedCat = getLinkedCategoryNameFromTemplate(mark, template.categories);
                            const linkedBal = getLinkedBalanceNameFromTemplate(mark, template.balances || []);
                            return (
                              <span key={i} className={`mark-tag ${mark.type}`}>
                                {mark.type === 'incoming' ? '+' : '-'} {mark.name}: {formatAmount(mark.amount, mark.currency || 'USD')}
                                {linkedCat && <span className="mark-link-indicator"> → {linkedCat}</span>}
                                {linkedBal && <span className="mark-link-indicator"> 💰{linkedBal}</span>}
                                {mark.dueDate && <span className="mark-due-indicator"> 📅</span>}
                              </span>
                            );
                          })}
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

            {/* Categories Section */}
            <div className="template-section">
              <h4>{t('categories')}</h4>
              <div className="categories-list">
                {categories.map((cat, index) => (
                  <div key={index} className="category-item" style={{ borderLeftColor: cat.color }}>
                    <span>{cat.name}: {formatAmount(cat.amount, cat.currency)}</span>
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
                <select
                  className="input currency-select"
                  value={newCategoryCurrency}
                  onChange={(e) => setNewCategoryCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
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

            {/* Balances Section */}
            <div className="template-section">
              <h4>{t('balances')}</h4>
              <div className="balances-template-list">
                {balances.map((bal, index) => (
                  <div key={index} className="balance-template-item">
                    <span>💰 {bal.name}: {formatAmount(bal.amount, bal.currency)}</span>
                    <button className="btn-icon" onClick={() => handleRemoveBalance(index)}>&times;</button>
                  </div>
                ))}
              </div>

              <div className="add-balance-inline">
                <input
                  type="text"
                  className="input"
                  placeholder={t('balanceNamePlaceholder')}
                  value={newBalanceName}
                  onChange={(e) => setNewBalanceName(e.target.value)}
                />
                <input
                  type="number"
                  className="input input-small"
                  placeholder={t('amount')}
                  value={newBalanceAmount}
                  onChange={(e) => setNewBalanceAmount(e.target.value)}
                  step="0.01"
                />
                <select
                  className="input currency-select"
                  value={newBalanceCurrency}
                  onChange={(e) => setNewBalanceCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
                <button className="btn btn-secondary" onClick={handleAddBalance}>{t('add')}</button>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="template-section">
              <h4>{t('transactions')}</h4>
              <div className="marks-template-list">
                {marks.map((mark, index) => {
                  const linkedCat = mark.categoryIndex !== undefined ? categories[mark.categoryIndex] : null;
                  const linkedBal = mark.balanceIndex !== undefined ? balances[mark.balanceIndex] : null;
                  return (
                    <div key={index} className={`mark-template-item ${mark.type}`}>
                      <span className="mark-type-indicator">{mark.type === 'incoming' ? '+' : '-'}</span>
                      <span className="mark-template-details">
                        {mark.name}: {formatAmount(mark.amount, mark.currency)}
                        {linkedCat && <span className="mark-link-badge"> → {linkedCat.name}</span>}
                        {linkedBal && <span className="mark-link-badge balance"> 💰{linkedBal.name}</span>}
                        {mark.dueDate && <span className="mark-link-badge due-date"> 📅 {mark.dueDate}</span>}
                      </span>
                      <button className="btn-icon" onClick={() => handleRemoveMark(index)}>&times;</button>
                    </div>
                  );
                })}
              </div>

              <div className="add-mark-template-form">
                <div className="add-mark-row">
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
                </div>
                <div className="add-mark-row">
                  <select
                    className="input"
                    value={newMarkCategoryIndex !== undefined ? newMarkCategoryIndex.toString() : ''}
                    onChange={(e) => setNewMarkCategoryIndex(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  >
                    <option value="">{t('noCategoryLink')}</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={i}>{cat.name} ({cat.currency})</option>
                    ))}
                  </select>
                  <select
                    className="input"
                    value={newMarkBalanceIndex !== undefined ? newMarkBalanceIndex.toString() : ''}
                    onChange={(e) => setNewMarkBalanceIndex(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  >
                    <option value="">{t('noBalanceLink')}</option>
                    {balances.map((bal, i) => (
                      <option key={i} value={i}>{bal.name} ({bal.currency})</option>
                    ))}
                  </select>
                  <div className="due-date-input">
                    <label>{t('dueDate')}</label>
                    <input
                      type="date"
                      className="input"
                      value={newMarkDueDate}
                      onChange={(e) => setNewMarkDueDate(e.target.value)}
                    />
                    {newMarkDueDate && (
                      <button
                        type="button"
                        className="btn-icon btn-clear-date"
                        onClick={() => setNewMarkDueDate('')}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddMark}>{t('add')}</button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateTemplate}
                disabled={!templateName.trim() || (categories.length === 0 && marks.length === 0 && balances.length === 0)}
              >
                {t('createTemplate')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setView('list');
                resetForm();
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
