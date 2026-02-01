import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { Mark, Currency } from '../types';

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

interface MarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarksPanel: React.FC<MarksPanelProps> = ({ isOpen, onClose }) => {
  const { state, getActiveSheet, addMark, toggleMark, removeMark, updateDollarBlueRate, moveMark, updateMark } = useApp();
  const { t } = useSettings();
  const [isAdding, setIsAdding] = useState<'incoming' | 'outgoing' | null>(null);
  const [newMarkName, setNewMarkName] = useState('');
  const [newMarkAmount, setNewMarkAmount] = useState('');
  const [newMarkCurrency, setNewMarkCurrency] = useState<Currency>('USD');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('');
  const [movingMarkId, setMovingMarkId] = useState<string | null>(null);
  const [selectedTargetSheet, setSelectedTargetSheet] = useState<string>('');
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editMarkName, setEditMarkName] = useState('');
  const [editMarkAmount, setEditMarkAmount] = useState('');
  const [editMarkCurrency, setEditMarkCurrency] = useState<Currency>('USD');
  const [newMarkCategoryId, setNewMarkCategoryId] = useState<string>('');
  const [editMarkCategoryId, setEditMarkCategoryId] = useState<string>('');

  const dollarBlueRate = state.dollarBlueRate || 1200;

  // Convert ARS to USD using the dollar blue rate
  const toUSD = (amount: number, currency: Currency): number => {
    return currency === 'ARS' ? amount / dollarBlueRate : amount;
  };

  const activeSheet = getActiveSheet();
  const marks = activeSheet?.marks || [];

  const incomingMarks = marks.filter(m => m.type === 'incoming');
  const outgoingMarks = marks.filter(m => m.type === 'outgoing');

  // Convert all amounts to USD for totals
  const totalIncoming = incomingMarks.reduce((sum, m) => sum + toUSD(m.amount, m.currency || 'USD'), 0);
  const completedIncoming = incomingMarks.filter(m => m.completed).reduce((sum, m) => sum + toUSD(m.amount, m.currency || 'USD'), 0);
  const totalOutgoing = outgoingMarks.reduce((sum, m) => sum + toUSD(m.amount, m.currency || 'USD'), 0);
  const completedOutgoing = outgoingMarks.filter(m => m.completed).reduce((sum, m) => sum + toUSD(m.amount, m.currency || 'USD'), 0);

  const handleAddMark = (type: 'incoming' | 'outgoing') => {
    if (newMarkName.trim()) {
      addMark(newMarkName.trim(), parseFloat(newMarkAmount) || 0, type, newMarkCurrency, newMarkCategoryId || undefined);
      setNewMarkName('');
      setNewMarkAmount('');
      setNewMarkCurrency('USD');
      setNewMarkCategoryId('');
      setIsAdding(null);
    }
  };

  const handleRateSave = () => {
    const newRate = parseFloat(rateInput);
    if (!isNaN(newRate) && newRate > 0) {
      updateDollarBlueRate(newRate);
    }
    setIsEditingRate(false);
  };

  const handleRateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRateSave();
    } else if (e.key === 'Escape') {
      setIsEditingRate(false);
    }
  };

  const handleMoveMark = () => {
    if (movingMarkId && selectedTargetSheet) {
      moveMark(movingMarkId, selectedTargetSheet);
      setMovingMarkId(null);
      setSelectedTargetSheet('');
    }
  };

  const otherSheets = state.sheets.filter(s => s.id !== state.activeSheetId);

  const startEditingMark = (mark: Mark) => {
    setEditingMarkId(mark.id);
    setEditMarkName(mark.name);
    setEditMarkAmount(mark.amount.toString());
    setEditMarkCurrency(mark.currency || 'USD');
    setEditMarkCategoryId(mark.categoryId || '');
  };

  const saveMarkEdit = () => {
    if (editingMarkId && editMarkName.trim()) {
      updateMark(editingMarkId, editMarkName.trim(), parseFloat(editMarkAmount) || 0, editMarkCurrency, editMarkCategoryId || undefined);
      setEditingMarkId(null);
      setEditMarkName('');
      setEditMarkAmount('');
      setEditMarkCurrency('USD');
      setEditMarkCategoryId('');
    }
  };

  const cancelMarkEdit = () => {
    setEditingMarkId(null);
    setEditMarkName('');
    setEditMarkAmount('');
    setEditMarkCurrency('USD');
    setEditMarkCategoryId('');
  };

  const categories = activeSheet?.categories || [];

  const renderMarkItem = (mark: Mark) => {
    const currency = mark.currency || 'USD';
    const usdEquivalent = toUSD(mark.amount, currency);
    const showConversion = currency === 'ARS';
    const isEditing = editingMarkId === mark.id;

    if (isEditing) {
      return (
        <div key={mark.id} className="mark-item editing">
          <div className="mark-edit-form">
            <input
              type="text"
              className="input"
              value={editMarkName}
              onChange={(e) => setEditMarkName(e.target.value)}
              placeholder={t('description')}
              autoFocus
            />
            <div className="mark-edit-row">
              <input
                type="number"
                className="input"
                value={editMarkAmount}
                onChange={(e) => setEditMarkAmount(e.target.value)}
                placeholder={t('amount')}
                step="0.01"
              />
              <select
                className="input currency-select"
                value={editMarkCurrency}
                onChange={(e) => setEditMarkCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <select
              className="input"
              value={editMarkCategoryId}
              onChange={(e) => setEditMarkCategoryId(e.target.value)}
            >
              <option value="">{t('noCategoryLink')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="mark-edit-actions">
              <button className="btn btn-primary btn-sm" onClick={saveMarkEdit}>{t('save')}</button>
              <button className="btn btn-secondary btn-sm" onClick={cancelMarkEdit}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      );
    }

    const linkedCategory = mark.categoryId ? categories.find(c => c.id === mark.categoryId) : null;

    return (
      <div key={mark.id} className={`mark-item ${mark.completed ? 'completed' : ''}`}>
        <label className="mark-checkbox">
          <input
            type="checkbox"
            checked={mark.completed}
            onChange={() => toggleMark(mark.id)}
          />
          <span className="checkmark"></span>
        </label>
        <div className="mark-info" onClick={() => startEditingMark(mark)} style={{ cursor: 'pointer' }}>
          <div className="mark-name-row">
            <span className="mark-name">{mark.name}</span>
            {linkedCategory && (
              <span className="mark-category-link" style={{ backgroundColor: linkedCategory.color }}>
                {linkedCategory.name}
              </span>
            )}
          </div>
          <div className="mark-amounts">
            <span className={`mark-amount ${currency === 'ARS' ? 'ars' : ''}`}>
              {formatAmount(mark.amount, currency)}
            </span>
            {showConversion && (
              <span className="mark-amount-converted">
                ({formatAmount(usdEquivalent, 'USD')})
              </span>
            )}
          </div>
        </div>
        {otherSheets.length > 0 && (
          <button
            className="btn-icon btn-move-mark"
            onClick={() => setMovingMarkId(mark.id)}
            title={t('moveToAnotherSheet')}
          >
            →
          </button>
        )}
        <button
          className="btn-icon btn-remove-mark"
          onClick={() => removeMark(mark.id)}
          title={t('removeTransaction')}
        >
          &times;
        </button>
      </div>
    );
  };

  const renderAddForm = (type: 'incoming' | 'outgoing') => (
    <div className="add-mark-form">
      <input
        type="text"
        className="input"
        placeholder={t('description')}
        value={newMarkName}
        onChange={(e) => setNewMarkName(e.target.value)}
        autoFocus
      />
      <div className="add-mark-amount-row">
        <input
          type="number"
          className="input"
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
      <select
        className="input"
        value={newMarkCategoryId}
        onChange={(e) => setNewMarkCategoryId(e.target.value)}
      >
        <option value="">{t('noCategoryLink')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <div className="add-mark-actions">
        <button className="btn btn-primary btn-sm" onClick={() => handleAddMark(type)}>
          {t('add')}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => {
          setIsAdding(null);
          setNewMarkName('');
          setNewMarkAmount('');
          setNewMarkCurrency('USD');
          setNewMarkCategoryId('');
        }}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="marks-panel">
      <div className="marks-panel-header">
        <h2>{t('transactions')}</h2>
        <button className="btn-icon" onClick={onClose}>&times;</button>
      </div>

      <div className="dollar-blue-rate">
        <span className="rate-label">{t('dollarBlue')}</span>
        {isEditingRate ? (
          <input
            type="number"
            className="input rate-input"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            onBlur={handleRateSave}
            onKeyDown={handleRateKeyDown}
            autoFocus
            step="0.01"
          />
        ) : (
          <button
            className="rate-value"
            onClick={() => {
              setRateInput(dollarBlueRate.toString());
              setIsEditingRate(true);
            }}
            title={t('clickToEdit')}
          >
            ARS ${dollarBlueRate}
          </button>
        )}
      </div>

      <div className="marks-section incoming">
        <div className="marks-section-header">
          <h3>{t('incoming')}</h3>
          <span className="marks-total">
            ${completedIncoming.toFixed(2)} / ${totalIncoming.toFixed(2)}
          </span>
        </div>
        <div className="marks-progress">
          <div
            className="marks-progress-bar incoming"
            style={{ width: totalIncoming > 0 ? `${(completedIncoming / totalIncoming) * 100}%` : '0%' }}
          />
        </div>
        <div className="marks-list">
          {incomingMarks.length === 0 && !isAdding && (
            <p className="empty-marks">{t('noIncomingTransactions')}</p>
          )}
          {incomingMarks.map(renderMarkItem)}
          {isAdding === 'incoming' ? (
            renderAddForm('incoming')
          ) : (
            <button
              className="btn btn-secondary btn-sm add-mark-btn"
              onClick={() => setIsAdding('incoming')}
            >
              {t('addIncoming')}
            </button>
          )}
        </div>
      </div>

      <div className="marks-section outgoing">
        <div className="marks-section-header">
          <h3>{t('outgoing')}</h3>
          <span className="marks-total">
            ${completedOutgoing.toFixed(2)} / ${totalOutgoing.toFixed(2)}
          </span>
        </div>
        <div className="marks-progress">
          <div
            className="marks-progress-bar outgoing"
            style={{ width: totalOutgoing > 0 ? `${(completedOutgoing / totalOutgoing) * 100}%` : '0%' }}
          />
        </div>
        <div className="marks-list">
          {outgoingMarks.length === 0 && !isAdding && (
            <p className="empty-marks">{t('noOutgoingTransactions')}</p>
          )}
          {outgoingMarks.map(renderMarkItem)}
          {isAdding === 'outgoing' ? (
            renderAddForm('outgoing')
          ) : (
            <button
              className="btn btn-secondary btn-sm add-mark-btn"
              onClick={() => setIsAdding('outgoing')}
            >
              {t('addOutgoing')}
            </button>
          )}
        </div>
      </div>

      <div className="marks-summary">
        <div className="summary-row">
          <span>{t('expectedBalance')}</span>
          <span className={totalIncoming - totalOutgoing >= 0 ? 'positive' : 'negative'}>
            ${(totalIncoming - totalOutgoing).toFixed(2)}
          </span>
        </div>
        <div className="summary-row">
          <span>{t('actualBalance')}</span>
          <span className={completedIncoming - completedOutgoing >= 0 ? 'positive' : 'negative'}>
            ${(completedIncoming - completedOutgoing).toFixed(2)}
          </span>
        </div>
      </div>

      {movingMarkId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('moveTransaction')}</h2>
              <button className="btn-icon" onClick={() => {
                setMovingMarkId(null);
                setSelectedTargetSheet('');
              }}>&times;</button>
            </div>
            <div className="modal-content">
              <p>{t('moveToSheet')}</p>
              <select
                className="input"
                value={selectedTargetSheet}
                onChange={(e) => setSelectedTargetSheet(e.target.value)}
              >
                <option value="">{t('selectSheetOption')}</option>
                {otherSheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleMoveMark}
                disabled={!selectedTargetSheet}
              >
                {t('move')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setMovingMarkId(null);
                setSelectedTargetSheet('');
              }}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
