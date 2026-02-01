import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { HistoryEntry } from '../types';

interface HistoryViewProps {
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onClose }) => {
  const { state } = useApp();
  const { t } = useSettings();
  const [filter, setFilter] = useState<'all' | 'current'>('current');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredHistory = state.history
    .filter((entry) => {
      if (filter === 'current' && entry.sheetId !== state.activeSheetId) {
        return false;
      }
      if (typeFilter !== 'all' && entry.type !== typeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const getEntryIcon = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'adjustment': return '~';
      case 'initial': return '+';
      case 'sheet_created': return '📋';
      case 'category_added': return '+';
      case 'category_removed': return '-';
      default: return '•';
    }
  };

  const getEntryDescription = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'sheet_created':
        const sheet = state.sheets.find(s => s.id === entry.sheetId);
        return `${t('newSheetCreated')}: ${sheet?.name || t('unknown')}`;
      case 'initial':
        return `${entry.categoryName} ${t('initializedWith')} $${entry.newAmount.toFixed(2)}`;
      case 'adjustment':
        const diff = entry.changeAmount;
        return `${entry.categoryName}: $${entry.previousAmount.toFixed(2)} → $${entry.newAmount.toFixed(2)} (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`;
      case 'category_added':
        return `${t('categoryAdded')}: ${entry.categoryName} ($${entry.newAmount.toFixed(2)})`;
      case 'category_removed':
        return `${t('categoryRemoved')}: ${entry.categoryName} ($${entry.previousAmount.toFixed(2)})`;
      default:
        return t('unknownAction');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>{t('history')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="history-filters">
          <div className="filter-group">
            <label>{t('sheet')}:</label>
            <select
              className="input input-small"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'current')}
            >
              <option value="current">{t('currentSheet')}</option>
              <option value="all">{t('allSheets')}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t('type')}:</label>
            <select
              className="input input-small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t('allTypes')}</option>
              <option value="adjustment">{t('adjustments')}</option>
              <option value="initial">{t('initialValues')}</option>
              <option value="category_added">{t('categoriesAdded')}</option>
              <option value="category_removed">{t('categoriesRemoved')}</option>
              <option value="sheet_created">{t('sheetsCreated')}</option>
            </select>
          </div>
        </div>

        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <p className="empty-message">{t('noHistoryFound')}</p>
          ) : (
            filteredHistory.map((entry) => (
              <div key={entry.id} className={`history-entry history-${entry.type}`}>
                <div className="history-icon">{getEntryIcon(entry.type)}</div>
                <div className="history-content">
                  <div className="history-description">
                    {getEntryDescription(entry)}
                  </div>
                  {entry.note && (
                    <div className="history-note">
                      Note: {entry.note}
                    </div>
                  )}
                  <div className="history-time">{formatDate(entry.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
