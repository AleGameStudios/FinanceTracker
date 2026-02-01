import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  showMarks: boolean;
  showCalculator: boolean;
  showNotes: boolean;
  onToggleMarks: () => void;
  onToggleCalculator: () => void;
  onToggleNotes: () => void;
  onShowTemplates: () => void;
  onShowHistory: () => void;
  onShowSettings: () => void;
  onShowHelp: () => void;
  onShowCalendar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  showMarks,
  showCalculator,
  showNotes,
  onToggleMarks,
  onToggleCalculator,
  onToggleNotes,
  onShowTemplates,
  onShowHistory,
  onShowSettings,
  onShowHelp,
  onShowCalendar,
}) => {
  const { t } = useSettings();

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <nav className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <h2>{t('menu')}</h2>
          <button className="mobile-nav-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="mobile-nav-items">
          <button
            className={`mobile-nav-item ${showMarks ? 'active' : ''}`}
            onClick={() => handleItemClick(onToggleMarks)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            {t('transactions')}
          </button>

          <button
            className={`mobile-nav-item ${showCalculator ? 'active' : ''}`}
            onClick={() => handleItemClick(onToggleCalculator)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="8" y2="10.01" />
              <line x1="12" y1="10" x2="12" y2="10.01" />
              <line x1="16" y1="10" x2="16" y2="10.01" />
              <line x1="8" y1="14" x2="8" y2="14.01" />
              <line x1="12" y1="14" x2="12" y2="14.01" />
              <line x1="16" y1="14" x2="16" y2="14.01" />
              <line x1="8" y1="18" x2="8" y2="18.01" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <line x1="16" y1="18" x2="16" y2="18.01" />
            </svg>
            {t('calculator')}
          </button>

          <button
            className={`mobile-nav-item ${showNotes ? 'active' : ''}`}
            onClick={() => handleItemClick(onToggleNotes)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            {t('notes')}
          </button>

          <button
            className="mobile-nav-item"
            onClick={() => handleItemClick(onShowCalendar)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {t('calendar')}
          </button>

          <div className="mobile-nav-divider" />

          <button
            className="mobile-nav-item"
            onClick={() => handleItemClick(onShowTemplates)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            {t('templates')}
          </button>

          <button
            className="mobile-nav-item"
            onClick={() => handleItemClick(onShowHistory)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {t('history')}
          </button>

          <button
            className="mobile-nav-item"
            onClick={() => handleItemClick(onShowSettings)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            {t('settings')}
          </button>

          <div className="mobile-nav-divider" />

          <button
            className="mobile-nav-item"
            onClick={() => handleItemClick(onShowHelp)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {t('help')}
          </button>
        </div>
      </nav>
    </>
  );
};
