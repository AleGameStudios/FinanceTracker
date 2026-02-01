import React, { useState } from 'react';
import type { Category, HistoryEntry, Currency } from '../types';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';

const formatCurrencyAmount = (amount: number, currency: Currency = 'USD'): string => {
  if (currency === 'ARS') {
    // Spanish formatting: periods for thousands, comma for decimals
    const formatted = amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `ARS $${formatted}`;
  }
  return `$${amount.toFixed(2)}`;
};

// Safe expression evaluator for basic math operations
const evaluateExpression = (expr: string): number | null => {
  // Remove whitespace
  const cleaned = expr.replace(/\s/g, '');

  // Only allow numbers, operators, decimal points, and parentheses
  if (!/^[\d+\-*/().]+$/.test(cleaned)) {
    return null;
  }

  try {
    // Use Function constructor for safe evaluation (no access to global scope)
    // This is safer than eval() as it creates an isolated scope
    const result = new Function(`return (${cleaned})`)();

    // Check if result is a valid finite number
    if (typeof result === 'number' && isFinite(result)) {
      return Math.round(result * 100) / 100; // Round to 2 decimal places
    }
    return null;
  } catch {
    return null;
  }
};

interface CategoryCardProps {
  category: Category;
  viewMode?: 'grid' | 'list';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, viewMode = 'grid' }) => {
  const { state, updateCategoryAmount, removeCategory, dispatch } = useApp();
  const { t } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(category.amount.toString());
  const [note, setNote] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [quickAdjustAmount, setQuickAdjustAmount] = useState<number | null>(null);
  const [quickAdjustNote, setQuickAdjustNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Get history entries for this category
  const categoryHistory = state.history
    .filter(entry => entry.categoryId === category.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntryDescription = (entry: HistoryEntry) => {
    const diff = entry.changeAmount;
    return `$${entry.previousAmount.toFixed(2)} → $${entry.newAmount.toFixed(2)} (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`;
  };

  const handleSave = () => {
    // Try to evaluate as expression first, fall back to parseFloat
    const evaluated = evaluateExpression(editAmount);
    const newAmount = evaluated !== null ? evaluated : parseFloat(editAmount);

    if (!isNaN(newAmount) && newAmount !== category.amount) {
      updateCategoryAmount(category.id, newAmount, note || undefined);
    }
    setIsEditing(false);
    setNote('');
  };

  const handleRemove = () => {
    removeCategory(category.id, note || undefined);
    setShowRemoveConfirm(false);
  };

  const openQuickAdjustModal = (adjustment: number) => {
    setQuickAdjustAmount(adjustment);
    setQuickAdjustNote('');
  };

  const handleQuickAdjustConfirm = () => {
    if (quickAdjustAmount !== null) {
      const newAmount = category.amount + quickAdjustAmount;
      const defaultNote = `Quick adjust: ${quickAdjustAmount > 0 ? '+' : ''}${quickAdjustAmount}`;
      updateCategoryAmount(category.id, newAmount, quickAdjustNote.trim() || defaultNote);
      setQuickAdjustAmount(null);
      setQuickAdjustNote('');
    }
  };

  const handleQuickAdjustCancel = () => {
    setQuickAdjustAmount(null);
    setQuickAdjustNote('');
  };

  const dollarBlueRate = state.dollarBlueRate || 1200;
  const currentCurrency = category.currency || 'USD';

  const handleConvertCurrency = () => {
    const newCurrency: Currency = currentCurrency === 'USD' ? 'ARS' : 'USD';
    let convertedAmount: number;

    if (currentCurrency === 'USD') {
      // Converting from USD to ARS
      convertedAmount = Math.round(category.amount * dollarBlueRate);
    } else {
      // Converting from ARS to USD
      convertedAmount = Math.round((category.amount / dollarBlueRate) * 100) / 100;
    }

    dispatch({
      type: 'CONVERT_CATEGORY_CURRENCY',
      payload: { categoryId: category.id, newCurrency, convertedAmount }
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="category-list-item" style={{ borderLeftColor: category.color }}>
        <div className="category-list-main">
          <span className="category-color-dot" style={{ backgroundColor: category.color }} />
          <span className="category-name">{category.name}</span>
          {categoryHistory.length > 0 && (
            <button
              className="btn-icon btn-history btn-history-inline"
              onClick={() => setShowHistory(true)}
              title={`${categoryHistory.length} history entries`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          )}
          <span className="category-amount">{formatCurrencyAmount(category.amount, category.currency)}</span>
        </div>

        {!isEditing ? (
          <div className="category-list-actions">
            <button
              className="btn-convert"
              onClick={handleConvertCurrency}
              title={currentCurrency === 'USD' ? t('convertToARS') : t('convertToUSD')}
            >
              {currentCurrency === 'USD' ? '→ARS' : '→USD'}
            </button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(-10)}>-10</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(-50)}>-50</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(50)}>+50</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(100)}>+100</button>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              setEditAmount(category.amount.toString());
              setIsEditing(true);
            }}>
              {t('edit')}
            </button>
            <button
              className="btn-icon btn-remove"
              onClick={() => setShowRemoveConfirm(true)}
              title={t('removeCategory')}
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="category-list-edit">
            <input
              type="text"
              className="input input-small"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="e.g. 400-25"
              autoFocus
            />
            <input
              type="text"
              className="input"
              placeholder={t('noteOptional')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSave}>{t('save')}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              setIsEditing(false);
              setNote('');
            }}>{t('cancel')}</button>
          </div>
        )}

        {showRemoveConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{t('removeCategory')}</h3>
              <p>{t('removeCategoryConfirm')} "{category.name}"?</p>
              <input
                type="text"
                className="input"
                placeholder={t('reasonForRemoval')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn btn-danger" onClick={handleRemove}>{t('remove')}</button>
                <button className="btn btn-secondary" onClick={() => {
                  setShowRemoveConfirm(false);
                  setNote('');
                }}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {quickAdjustAmount !== null && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{t('quickAdjust')}: {quickAdjustAmount > 0 ? '+' : ''}{quickAdjustAmount}</h3>
              <p>
                {category.name}: ${category.amount.toFixed(2)} → ${(category.amount + quickAdjustAmount).toFixed(2)}
              </p>
              <input
                type="text"
                className="input"
                placeholder={t('addNoteOptional')}
                value={quickAdjustNote}
                onChange={(e) => setQuickAdjustNote(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleQuickAdjustConfirm}>{t('confirm')}</button>
                <button className="btn btn-secondary" onClick={handleQuickAdjustCancel}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{category.name} - {t('categoryHistoryTitle')}</h3>
                <button className="btn-icon" onClick={() => setShowHistory(false)}>&times;</button>
              </div>
              <div className="category-history-list">
                {categoryHistory.length === 0 ? (
                  <p className="empty-message">{t('noCategoryHistory')}</p>
                ) : (
                  categoryHistory.map((entry) => (
                    <div key={entry.id} className="category-history-entry">
                      <div className="category-history-change">
                        {getEntryDescription(entry)}
                      </div>
                      {entry.note && (
                        <div className="category-history-note">{entry.note}</div>
                      )}
                      <div className="category-history-time">{formatDate(entry.timestamp)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="category-card" style={{ borderLeftColor: category.color }}>
      <div className="category-header">
        <div className="category-title-row">
          <h3 className="category-name">{category.name}</h3>
          {categoryHistory.length > 0 && (
            <button
              className="btn-icon btn-history"
              onClick={() => setShowHistory(true)}
              title={`${categoryHistory.length} history entries`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          )}
        </div>
        <button
          className="btn-icon btn-remove"
          onClick={() => setShowRemoveConfirm(true)}
          title={t('removeCategory')}
        >
          &times;
        </button>
      </div>

      {!isEditing ? (
        <div className="category-content">
          <div className="category-amount">{formatCurrencyAmount(category.amount, category.currency)}</div>
          <div className="category-actions">
            <button
              className="btn-convert"
              onClick={handleConvertCurrency}
              title={currentCurrency === 'USD' ? t('convertToARS') : t('convertToUSD')}
            >
              {currentCurrency === 'USD' ? '→ARS' : '→USD'}
            </button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(-10)}>-10</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(-50)}>-50</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(50)}>+50</button>
            <button className="btn-adjust" onClick={() => openQuickAdjustModal(100)}>+100</button>
          </div>
          <button className="btn btn-secondary" onClick={() => {
            setEditAmount(category.amount.toString());
            setIsEditing(true);
          }}>
            {t('editAmount')}
          </button>
        </div>
      ) : (
        <div className="category-edit">
          <input
            type="text"
            className="input"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            placeholder="e.g. 400-25"
            autoFocus
          />
          <input
            type="text"
            className="input"
            placeholder={t('noteOptional')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="edit-actions">
            <button className="btn btn-primary" onClick={handleSave}>{t('save')}</button>
            <button className="btn btn-secondary" onClick={() => {
              setIsEditing(false);
              setNote('');
            }}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('removeCategory')}</h3>
            <p>{t('removeCategoryConfirm')} "{category.name}"?</p>
            <input
              type="text"
              className="input"
              placeholder={t('reasonForRemoval')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleRemove}>{t('remove')}</button>
              <button className="btn btn-secondary" onClick={() => {
                setShowRemoveConfirm(false);
                setNote('');
              }}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {quickAdjustAmount !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('quickAdjust')}: {quickAdjustAmount > 0 ? '+' : ''}{quickAdjustAmount}</h3>
            <p>
              {category.name}: ${category.amount.toFixed(2)} → ${(category.amount + quickAdjustAmount).toFixed(2)}
            </p>
            <input
              type="text"
              className="input"
              placeholder={t('addNoteOptional')}
              value={quickAdjustNote}
              onChange={(e) => setQuickAdjustNote(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleQuickAdjustConfirm}>{t('confirm')}</button>
              <button className="btn btn-secondary" onClick={handleQuickAdjustCancel}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{category.name} - {t('categoryHistoryTitle')}</h3>
              <button className="btn-icon" onClick={() => setShowHistory(false)}>&times;</button>
            </div>
            <div className="category-history-list">
              {categoryHistory.length === 0 ? (
                <p className="empty-message">{t('noCategoryHistory')}</p>
              ) : (
                categoryHistory.map((entry) => (
                  <div key={entry.id} className="category-history-entry">
                    <div className="category-history-change">
                      {getEntryDescription(entry)}
                    </div>
                    {entry.note && (
                      <div className="category-history-note">{entry.note}</div>
                    )}
                    <div className="category-history-time">{formatDate(entry.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
