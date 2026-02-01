import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';

interface SheetSelectorProps {
  onNewSheet: () => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({ onNewSheet }) => {
  const { state, setActiveSheet, deleteSheet, updateCurrentBalance } = useApp();
  const { t } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

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
          <div className="current-balance">
            <span className="balance-label">{t('currentBalance')}</span>
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
          <span className="sheet-date">
            {t('started')} {new Date(activeSheet.createdAt).toLocaleDateString()}
          </span>
          <span className="sheet-total">
            {t('monthTotal')} ${activeSheet.categories.reduce((sum, cat) => sum + cat.amount, 0).toFixed(2)}
          </span>
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
