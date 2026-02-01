import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { exportData, importData } from '../utils/storage';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { Theme } from '../context/SettingsContext';
import type { Language } from '../i18n';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { state, importData: importAppData } = useApp();
  const { t, theme, setTheme, language, setLanguage, palette, setPalette, palettePresets } = useSettings();
  const { isInstallable, isInstalled, isIOSSafari, installApp } = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData(state);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importData(file);
        importAppData(data);
        alert(t('importSuccess'));
      } catch {
        alert(t('importError'));
      }
    }
  };

  const isPaletteActive = (presetColors: { primary: string; accent: string }) => {
    return palette.primary === presetColors.primary && palette.accent === presetColors.accent;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>{t('settings')}</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-content">
          {/* Appearance Section */}
          <div className="settings-section">
            <h3>{t('appearance')}</h3>
            <div className="settings-section-appearance">
              {/* Theme */}
              <div className="settings-row">
                <span className="settings-row-label">{t('theme')}</span>
                <div className="theme-toggle">
                  <button
                    className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light' as Theme)}
                  >
                    {t('lightMode')}
                  </button>
                  <button
                    className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark' as Theme)}
                  >
                    {t('darkMode')}
                  </button>
                  <button
                    className={`theme-toggle-btn ${theme === 'system' ? 'active' : ''}`}
                    onClick={() => setTheme('system' as Theme)}
                  >
                    {t('systemTheme')}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="settings-row">
                <span className="settings-row-label">{t('language')}</span>
                <select
                  className="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  <option value="en">{t('english')}</option>
                  <option value="es">{t('spanish')}</option>
                </select>
              </div>

              {/* Color Palette */}
              <div>
                <span className="settings-row-label">{t('colorPalette')}</span>
                <div className="palette-presets">
                  {palettePresets.map((preset) => (
                    <button
                      key={preset.name}
                      className={`palette-preset ${isPaletteActive(preset.colors) ? 'active' : ''}`}
                      onClick={() => setPalette(preset.colors)}
                    >
                      <div className="palette-colors">
                        <div
                          className="palette-color"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <div
                          className="palette-color"
                          style={{ backgroundColor: preset.colors.accent }}
                        />
                      </div>
                      <span className="palette-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="settings-section">
            <h3>{t('dataManagement')}</h3>
            <p>{t('exportDescription')}</p>

            <div className="settings-actions">
              <button className="btn btn-primary" onClick={handleExport}>
                {t('exportData')}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('importData')}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="settings-section">
            <h3>{t('statistics')}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{state.sheets.length}</span>
                <span className="stat-label">{t('sheets')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{state.templates.length}</span>
                <span className="stat-label">{t('templates')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{state.history.length}</span>
                <span className="stat-label">{t('historyEntries')}</span>
              </div>
            </div>
          </div>

          {/* Install App */}
          <div className="settings-section">
            <h3>{t('installApp')}</h3>
            {isInstalled ? (
              <p className="text-muted">{t('appAlreadyInstalled')}</p>
            ) : isIOSSafari ? (
              <div className="ios-install-instructions">
                <p>{t('iosInstallInstructions')}</p>
                <ol>
                  <li>{t('iosStep1')}</li>
                  <li>{t('iosStep2')}</li>
                </ol>
              </div>
            ) : isInstallable ? (
              <div className="settings-actions">
                <button className="btn btn-primary" onClick={installApp}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('installApp')}
                </button>
              </div>
            ) : (
              <p className="text-muted">{t('installNotAvailable')}</p>
            )}
          </div>

          {/* About */}
          <div className="settings-section">
            <h3>{t('about')}</h3>
            <p>Finance Tracker PWA v1.0.0</p>
            <p className="text-muted">{t('appDescription')}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
