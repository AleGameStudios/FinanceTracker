import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { Currency, Balance } from '../types';

interface SheetSelectorProps {
  onNewSheet: () => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({ onNewSheet }) => {
  const { state, setActiveSheet, deleteSheet, updateCurrentBalance, addBalance, updateBalance, removeBalance } = useApp();
  const { t } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [newBalanceName, setNewBalanceName] = useState('');
  const [newBalanceAmount, setNewBalanceAmount] = useState('0');
  const [newBalanceCurrency, setNewBalanceCurrency] = useState<Currency>('USD');
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [editBalanceName, setEditBalanceName] = useState('');
  const [editBalanceAmount, setEditBalanceAmount] = useState('');
  const [editBalanceCurrency, setEditBalanceCurrency] = useState<Currency>('USD');

  const handleDeleteSheet = (sheetId: string) => {
    deleteSheet(sheetId);
    setShowDeleteConfirm(null);
  };

  const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);

  const handleBalanceClick = () => {
    setBalanceInput((activeSheet?.currentBalance || 0).toString());
    setIsEditingBalance(true);
  };

  const handleBalanceSave = () => {
    const newBalance = parseFloat(balanceInput);
    if (!isNaN(newBalance)) {
      updateCurrentBalance(newBalance);
    }
    setIsEditingBalance(false);
  };

  const handleBalanceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBalanceSave();
    } else if (e.key === 'Escape') {
      setIsEditingBalance(false);
    }
  };

  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBalanceName.trim()) {
      addBalance(newBalanceName.trim(), parseFloat(newBalanceAmount) || 0, newBalanceCurrency);
      setNewBalanceName('');
      setNewBalanceAmount('0');
      setNewBalanceCurrency('USD');
      setShowAddBalance(false);
    }
  };

  const handleEditBalance = (balance: Balance) => {
    setEditingBalanceId(balance.id);
    setEditBalanceName(balance.name);
    setEditBalanceAmount(balance.amount.toString());
    setEditBalanceCurrency(balance.currency);
  };

  const handleSaveEditBalance = () => {
    if (editingBalanceId && editBalanceName.trim()) {
      updateBalance(editingBalanceId, editBalanceName.trim(), parseFloat(editBalanceAmount) || 0, editBalanceCurrency);
      setEditingBalanceId(null);
    }
  };

  const handleRemoveBalance = (balanceId: string) => {
    if (confirm(t('deleteBalanceConfirm'))) {
      removeBalance(balanceId);
    }
  };

  const formatCurrency = (amount: number, currency: Currency) => {
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

  // Calculate totals by currency
  const categoryTotals = activeSheet?.categories.reduce((acc, cat) => {
    const currency = cat.currency || 'USD';
    acc[currency] = (acc[currency] || 0) + cat.amount;
    return acc;
  }, {} as Record<Currency, number>) || {};

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
                title={t('deleteSheet')}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-primary btn-new-sheet" onClick={onNewSheet}>
          + {t('newSheet')}
        </button>
      </div>

      {activeSheet && (
        <div className="sheet-info">
          {/* Multiple Balances Section */}
          <div className="balances-section">
            <div className="balances-header">
              <span className="balance-label">{t('balances')}</span>
              <button
                className="btn btn-small btn-primary"
                onClick={() => setShowAddBalance(true)}
                title={t('addBalance')}
              >
                +
              </button>
            </div>

            {(activeSheet.balances || []).length === 0 && !activeSheet.currentBalance ? (
              <div className="no-balances">{t('noBalances')}</div>
            ) : (
              <div className="balances-list">
                {/* Legacy current balance (for backwards compatibility) */}
                {activeSheet.currentBalance !== undefined && activeSheet.currentBalance !== null && (activeSheet.balances || []).length === 0 && (
                  <div className="balance-item">
                    <span className="balance-name">{t('currentBalance')}</span>
                    {isEditingBalance ? (
                      <input
                        type="number"
                        className="input balance-input"
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        onBlur={handleBalanceSave}
                        onKeyDown={handleBalanceKeyDown}
                        autoFocus
                        step="0.01"
                      />
                    ) : (
                      <button className="balance-value" onClick={handleBalanceClick} title={t('clickToEdit')}>
                        ${(activeSheet.currentBalance || 0).toFixed(2)}
                      </button>
                    )}
                  </div>
                )}

                {/* New balances system */}
                {(activeSheet.balances || []).map((balance) => (
                  <div key={balance.id} className="balance-item">
                    {editingBalanceId === balance.id ? (
                      <div className="balance-edit-form">
                        <input
                          type="text"
                          className="input"
                          value={editBalanceName}
                          onChange={(e) => setEditBalanceName(e.target.value)}
                          placeholder={t('balanceName')}
                        />
                        <input
                          type="number"
                          className="input"
                          value={editBalanceAmount}
                          onChange={(e) => setEditBalanceAmount(e.target.value)}
                          step="0.01"
                        />
                        <select
                          className="currency-select"
                          value={editBalanceCurrency}
                          onChange={(e) => setEditBalanceCurrency(e.target.value as Currency)}
                        >
                          <option value="USD">USD</option>
                          <option value="ARS">ARS</option>
                        </select>
                        <button className="btn btn-small btn-primary" onClick={handleSaveEditBalance}>
                          {t('save')}
                        </button>
                        <button className="btn btn-small btn-secondary" onClick={() => setEditingBalanceId(null)}>
                          {t('cancel')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="balance-name">{balance.name}</span>
                        <span className="balance-value" onClick={() => handleEditBalance(balance)}>
                          {formatCurrency(balance.amount, balance.currency)}
                        </span>
                        <button
                          className="btn-icon btn-delete-balance"
                          onClick={() => handleRemoveBalance(balance.id)}
                          title={t('deleteBalance')}
                        >
                          &times;
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="sheet-date">
            {t('started')} {new Date(activeSheet.createdAt).toLocaleDateString('en-GB')}
          </span>
          <div className="sheet-totals">
            {Object.entries(categoryTotals).map(([currency, total]) => (
              <span key={currency} className="sheet-total">
                {t('monthTotal')} {formatCurrency(total as number, currency as Currency)}
              </span>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <span className="sheet-total">{t('monthTotal')} $0.00</span>
            )}
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {showAddBalance && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('addBalance')}</h3>
            <form onSubmit={handleAddBalance}>
              <input
                type="text"
                className="input"
                placeholder={t('balanceNamePlaceholder')}
                value={newBalanceName}
                onChange={(e) => setNewBalanceName(e.target.value)}
                autoFocus
                required
              />
              <div className="amount-currency-row">
                <input
                  type="number"
                  className="input"
                  placeholder={t('amount')}
                  value={newBalanceAmount}
                  onChange={(e) => setNewBalanceAmount(e.target.value)}
                  step="0.01"
                />
                <select
                  className="currency-select"
                  value={newBalanceCurrency}
                  onChange={(e) => setNewBalanceCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">{t('add')}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddBalance(false)}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('deleteSheet')}</h3>
            <p>{t('deleteSheetConfirm')}</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => handleDeleteSheet(showDeleteConfirm)}>
                {t('delete')}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
