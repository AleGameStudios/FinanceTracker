import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: (permanently: boolean) => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  const { t } = useSettings();

  return (
    <div className="modal-overlay">
      <div className="modal modal-install">
        <div className="install-prompt-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <h3>{t('installAppTitle')}</h3>
        <p>{t('installAppDescription')}</p>
        <ul className="install-benefits">
          <li>{t('installBenefit1')}</li>
          <li>{t('installBenefit2')}</li>
          <li>{t('installBenefit3')}</li>
        </ul>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onInstall}>
            {t('installNow')}
          </button>
          <button className="btn btn-secondary" onClick={() => onDismiss(false)}>
            {t('maybeLater')}
          </button>
        </div>
        <button className="install-dont-show" onClick={() => onDismiss(true)}>
          {t('dontShowAgain')}
        </button>
      </div>
    </div>
  );
};
