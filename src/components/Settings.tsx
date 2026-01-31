import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { exportData, importData } from '../utils/storage';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { state, importData: importAppData } = useApp();
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
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Data Management</h3>
            <p>Export your data to create a backup or import previously exported data.</p>

            <div className="settings-actions">
              <button className="btn btn-primary" onClick={handleExport}>
                Export Data
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
                Import Data
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{state.sheets.length}</span>
                <span className="stat-label">Sheets</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{state.templates.length}</span>
                <span className="stat-label">Templates</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{state.history.length}</span>
                <span className="stat-label">History Entries</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>About</h3>
            <p>Finance Tracker PWA v1.0.0</p>
            <p className="text-muted">Track your finances with categories, templates, and monthly sheets.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
