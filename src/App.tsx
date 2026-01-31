import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CategoryCard } from './components/CategoryCard';
import { AddCategory } from './components/AddCategory';
import { SheetSelector } from './components/SheetSelector';
import { NewSheetModal } from './components/NewSheetModal';
import { TemplateManager } from './components/TemplateManager';
import { HistoryView } from './components/HistoryView';
import { Settings } from './components/Settings';
import './App.css';

const AppContent: React.FC = () => {
  const { state, getActiveSheet } = useApp();
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const activeSheet = getActiveSheet();

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
          </div>
        </main>
        {showNewSheet && <NewSheetModal onClose={() => setShowNewSheet(false)} />}
        {showTemplates && <TemplateManager onClose={() => setShowTemplates(false)} />}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Finance Tracker</h1>
        <nav className="nav">
          <button className="nav-btn" onClick={() => setShowTemplates(true)}>Templates</button>
          <button className="nav-btn" onClick={() => setShowHistory(true)}>History</button>
          <button className="nav-btn" onClick={() => setShowSettings(true)}>Settings</button>
        </nav>
      </header>

      <SheetSelector onNewSheet={() => setShowNewSheet(true)} />

      <main className="main">
        {activeSheet ? (
          <>
            <div className="categories-grid">
              {activeSheet.categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
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

      {showNewSheet && <NewSheetModal onClose={() => setShowNewSheet(false)} />}
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
