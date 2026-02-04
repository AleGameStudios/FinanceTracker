import React, { useState } from 'react';
import type { Tracker, Currency } from '../types';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { categoryColors } from '../utils/colors';

const formatCurrencyAmount = (amount: number, currency: Currency = 'USD'): string => {
  if (currency === 'ARS') {
    const formatted = amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `ARS $${formatted}`;
  }
  return `$${amount.toFixed(2)}`;
};

interface TrackerCardProps {
  tracker: Tracker;
  viewMode?: 'grid' | 'list';
}

export const TrackerCard: React.FC<TrackerCardProps> = ({ tracker, viewMode = 'grid' }) => {
  const { state, removeTracker, updateTracker } = useApp();
  const { t } = useSettings();
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState(tracker.name);
  const [editColor, setEditColor] = useState(tracker.color);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Calculate total from completed transactions linked to this tracker
  const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
  const trackerMarks = activeSheet?.marks.filter(m => m.trackerId === tracker.id && m.completed) || [];

  const trackerTotal = trackerMarks.reduce((sum, m) => {
    // For trackers, both incoming and outgoing add to the total (tracking spend)
    return sum + m.amount;
  }, 0);

  const handleSaveDetails = () => {
    if (editName.trim() && (editName !== tracker.name || editColor !== tracker.color)) {
      updateTracker(tracker.id, editName.trim(), editColor);
    }
    setIsEditingDetails(false);
  };

  const handleCancelEditDetails = () => {
    setEditName(tracker.name);
    setEditColor(tracker.color);
    setIsEditingDetails(false);
  };

  const handleRemove = () => {
    removeTracker(tracker.id);
    setShowRemoveConfirm(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="category-list-item tracker-list-item" style={{ borderLeftColor: tracker.color }}>
        <div className="category-list-main">
          <span className="category-color-dot" style={{ backgroundColor: tracker.color }} />
          <span className="category-name">{tracker.name}</span>
          <button
            className="btn-icon btn-edit"
            onClick={() => {
              setEditName(tracker.name);
              setEditColor(tracker.color);
              setIsEditingDetails(true);
            }}
            title={t('editTracker') || 'Edit Tracker'}
          >
            ✏️
          </button>
          <span className="category-amount tracker-amount">
            {formatCurrencyAmount(trackerTotal, tracker.currency)}
          </span>
          <button
            className="btn-icon btn-remove"
            onClick={() => setShowRemoveConfirm(true)}
            title={t('removeTracker')}
          >
            &times;
          </button>
        </div>

        {showRemoveConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{t('removeTracker')}</h3>
              <p>{t('removeTrackerConfirm') || 'Are you sure you want to remove'} "{tracker.name}"?</p>
              <div className="modal-actions">
                <button className="btn btn-danger" onClick={handleRemove}>{t('remove')}</button>
                <button className="btn btn-secondary" onClick={() => setShowRemoveConfirm(false)}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {isEditingDetails && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{t('editTracker') || 'Edit Tracker'}</h3>
                <button className="btn-icon" onClick={handleCancelEditDetails}>&times;</button>
              </div>
              <div className="edit-category-form">
                <label className="form-label">{t('trackerName')}</label>
                <input
                  type="text"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <label className="form-label">{t('categoryColor')}</label>
                <div className="color-picker-grid">
                  {categoryColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-option ${editColor === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveDetails}
                  disabled={!editName.trim()}
                >
                  {t('save')}
                </button>
                <button className="btn btn-secondary" onClick={handleCancelEditDetails}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="category-card tracker-card" style={{ borderLeftColor: tracker.color }}>
      <div className="category-header">
        <div className="category-title-row">
          <h3 className="category-name">{tracker.name}</h3>
          <button
            className="btn-icon btn-edit"
            onClick={() => {
              setEditName(tracker.name);
              setEditColor(tracker.color);
              setIsEditingDetails(true);
            }}
            title={t('editTracker') || 'Edit Tracker'}
          >
            ✏️
          </button>
        </div>
        <button
          className="btn-icon btn-remove"
          onClick={() => setShowRemoveConfirm(true)}
          title={t('removeTracker')}
        >
          &times;
        </button>
      </div>

      <div className="category-content">
        <div className="category-amount tracker-amount">
          {formatCurrencyAmount(trackerTotal, tracker.currency)}
        </div>
        <div className="tracker-info">
          <span className="tracker-label">{t('trackerTotal')}</span>
          <span className="tracker-transactions">
            {trackerMarks.length} {t('completedTransactions') || 'transactions'}
          </span>
        </div>
      </div>

      {showRemoveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('removeTracker')}</h3>
            <p>{t('removeTrackerConfirm') || 'Are you sure you want to remove'} "{tracker.name}"?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleRemove}>{t('remove')}</button>
              <button className="btn btn-secondary" onClick={() => setShowRemoveConfirm(false)}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {isEditingDetails && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t('editTracker') || 'Edit Tracker'}</h3>
              <button className="btn-icon" onClick={handleCancelEditDetails}>&times;</button>
            </div>
            <div className="edit-category-form">
              <label className="form-label">{t('trackerName')}</label>
              <input
                type="text"
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <label className="form-label">{t('categoryColor')}</label>
              <div className="color-picker-grid">
                {categoryColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${editColor === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSaveDetails}
                disabled={!editName.trim()}
              >
                {t('save')}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelEditDetails}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
