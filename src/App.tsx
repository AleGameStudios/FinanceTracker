import React, { useState, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CategoryCard } from './components/CategoryCard';
import { AddCategory } from './components/AddCategory';
import { SheetSelector } from './components/SheetSelector';
import { NewSheetModal } from './components/NewSheetModal';
import { TemplateManager } from './components/TemplateManager';
import { HistoryView } from './components/HistoryView';
import { Settings } from './components/Settings';
import { MarksPanel } from './components/MarksPanel';
import { Calculator } from './components/Calculator';
import { Notes } from './components/Notes';
import { importData } from './utils/storage';
import './App.css';

const AppContent: React.FC = () => {
  const { state, getActiveSheet, setViewMode, importData: importAppData } = useApp();
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarks, setShowMarks] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSheet = getActiveSheet();
  const viewMode = state.viewMode || 'grid';

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importData(file);
        importAppData(data);
      } catch (error) {
        alert('Failed to import data. Please make sure the file is a valid backup.');
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show welcome screen if no sheets exist
  if (state.sheets.length === 0) {
    return (
      <div className="app">
        <header className="header">
          <h1>Finance Tracker</h1>
        </header>
        <main className="main welcome-screen">
          <div className="welcome-content">
            <h2>Welcome to Finance Tracker</h2>
            <p>Start by creating your first monthly sheet to track your finances.</p>
            <button className="btn btn-primary btn-large" onClick={() => setShowNewSheet(true)}>
              Create Your First Sheet
            </button>
            <p className="text-muted">or</p>
            <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>
              Create a Template First
            </button>
            <p className="text-muted">or</p>
            <button className="btn btn-secondary" onClick={handleImportClick}>
              Import Existing Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </main>
        {showNewSheet && <NewSheetModal onClose={() => setShowNewSheet(false)} />}
        {showTemplates && <TemplateManager onClose={() => setShowTemplates(false)} />}
      </div>
    );
  }

  return (
    <div className={`app ${showMarks ? 'with-sidebar-left' : ''} ${showCalculator ? 'with-sidebar-right' : ''}`}>
      <header className="header">
        <h1>Finance Tracker</h1>
        <nav className="nav">
          <button
            className={`nav-btn ${showMarks ? 'active' : ''}`}
            onClick={() => setShowMarks(!showMarks)}
          >
            Marks
          </button>
          <button
            className={`nav-btn ${showCalculator ? 'active' : ''}`}
            onClick={() => setShowCalculator(!showCalculator)}
          >
            Calculator
          </button>
          <button
            className={`nav-btn ${showNotes ? 'active' : ''}`}
            onClick={() => setShowNotes(!showNotes)}
          >
            Notes
          </button>
          <button className="nav-btn" onClick={() => setShowTemplates(true)}>Templates</button>
          <button className="nav-btn" onClick={() => setShowHistory(true)}>History</button>
          <button className="nav-btn" onClick={() => setShowSettings(true)}>Settings</button>
        </nav>
      </header>

      <div className="app-body">
        <MarksPanel isOpen={showMarks} onClose={() => setShowMarks(false)} />

        <div className="main-content">

          <SheetSelector onNewSheet={() => setShowNewSheet(true)} />

          <main className="main">
            {activeSheet ? (
              <>
                <div className="view-controls">
                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="6" height="6" rx="1" />
                        <rect x="9" y="1" width="6" height="6" rx="1" />
                        <rect x="1" y="9" width="6" height="6" rx="1" />
                        <rect x="9" y="9" width="6" height="6" rx="1" />
                      </svg>
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="14" height="3" rx="1" />
                        <rect x="1" y="6" width="14" height="3" rx="1" />
                        <rect x="1" y="11" width="14" height="3" rx="1" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={viewMode === 'grid' ? 'categories-grid' : 'categories-list'}>
                  {activeSheet.categories.map((category) => (
                    <CategoryCard key={category.id} category={category} viewMode={viewMode} />
                  ))}
                </div>
                <AddCategory />
              </>
            ) : (
              <div className="empty-state">
                <p>Select a sheet or create a new one to get started.</p>
              </div>
            )}
          </main>
        </div>

        <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      </div>

      {showNewSheet && <NewSheetModal onClose={() => setShowNewSheet(false)} />}
      <Notes isOpen={showNotes} onClose={() => setShowNotes(false)} />
      {showTemplates && <TemplateManager onClose={() => setShowTemplates(false)} />}
      {showHistory && <HistoryView onClose={() => setShowHistory(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
