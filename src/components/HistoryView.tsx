import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { HistoryEntry } from '../types';

interface HistoryViewProps {
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onClose }) => {
  const { state } = useApp();
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
        return `New sheet created: ${sheet?.name || 'Unknown'}`;
      case 'initial':
        return `${entry.categoryName} initialized with $${entry.newAmount.toFixed(2)}`;
      case 'adjustment':
        const diff = entry.changeAmount;
        return `${entry.categoryName}: $${entry.previousAmount.toFixed(2)} → $${entry.newAmount.toFixed(2)} (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`;
      case 'category_added':
        return `Category added: ${entry.categoryName} ($${entry.newAmount.toFixed(2)})`;
      case 'category_removed':
        return `Category removed: ${entry.categoryName} ($${entry.previousAmount.toFixed(2)})`;
      default:
        return 'Unknown action';
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
          <h2>History</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="history-filters">
          <div className="filter-group">
            <label>Sheet:</label>
            <select
              className="input input-small"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'current')}
            >
              <option value="current">Current Sheet</option>
              <option value="all">All Sheets</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select
              className="input input-small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="adjustment">Adjustments</option>
              <option value="initial">Initial Values</option>
              <option value="category_added">Categories Added</option>
              <option value="category_removed">Categories Removed</option>
              <option value="sheet_created">Sheets Created</option>
            </select>
          </div>
        </div>

        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <p className="empty-message">No history entries found.</p>
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
