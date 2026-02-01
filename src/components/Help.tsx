import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface HelpProps {
  onClose: () => void;
}

export const Help: React.FC<HelpProps> = ({ onClose }) => {
  const { t } = useSettings();

  return (
    <div className="modal-overlay">
      <div className="modal modal-large modal-help">
        <div className="modal-header">
          <h2>{t('helpTitle')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="help-content">
          <p className="help-intro">{t('helpIntro')}</p>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpSheetsTitle')}</h3>
              <p>{t('helpSheetsDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpCategoriesTitle')}</h3>
              <p>{t('helpCategoriesDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpTransactionsTitle')}</h3>
              <p>{t('helpTransactionsDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpTemplatesTitle')}</h3>
              <p>{t('helpTemplatesDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpCalculatorTitle')}</h3>
              <p>{t('helpCalculatorDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpNotesTitle')}</h3>
              <p>{t('helpNotesDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpHistoryTitle')}</h3>
              <p>{t('helpHistoryDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpDollarBlueTitle')}</h3>
              <p>{t('helpDollarBlueDesc')}</p>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="6" y1="8" x2="18" y2="8" />
                <line x1="6" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <div className="help-section-content">
              <h3>{t('helpCurrentBalanceTitle')}</h3>
              <p>{t('helpCurrentBalanceDesc')}</p>
            </div>
          </div>

          <div className="help-tips">
            <h3>{t('helpTipsTitle')}</h3>
            <ul>
              <li>{t('helpTip1')}</li>
              <li>{t('helpTip2')}</li>
              <li>{t('helpTip3')}</li>
              <li>{t('helpTip4')}</li>
              <li>{t('helpTip5')}</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
