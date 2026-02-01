import React, { useState, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
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
import { Help } from './components/Help';
import { LoginScreen } from './components/LoginScreen';
import { UserMenu } from './components/UserMenu';
import { MobileNav } from './components/MobileNav';
import { importData } from './utils/storage';
import './App.css';

const AppContent: React.FC = () => {
  const { state, getActiveSheet, setViewMode, importData: importAppData, isLoading, isSyncing } = useApp();
  const { t, isMobileMenuOpen, setMobileMenuOpen } = useSettings();
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarks, setShowMarks] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSheet = getActiveSheet();
  const viewMode = state.viewMode || 'grid';

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importData(file);
        importAppData(data);
      } catch {
        alert(t('importError'));
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show welcome screen if no sheets exist
  if (state.sheets.length === 0) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-left">
            <h1>{t('appName')}</h1>
          </div>
          <div className="header-right">
            <UserMenu />
          </div>
        </header>
        <main className="main welcome-screen">
          <div className="welcome-content">
            <h2>{t('welcomeTitle')}</h2>
            <p>{t('welcomeDescription')}</p>
            <button className="btn btn-primary btn-large" onClick={() => setShowNewSheet(true)}>
              {t('createFirstSheet')}
            </button>
            <p className="text-muted">{t('or')}</p>
            <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>
              {t('createTemplateFirst')}
            </button>
            <p className="text-muted">{t('or')}</p>
            <button className="btn btn-secondary" onClick={handleImportClick}>
              {t('importExistingData')}
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
        <div className="header-left">
          <h1>{t('appName')}</h1>
          {isSyncing && <span className="sync-indicator">{t('syncing')}</span>}
        </div>
        <nav className="nav">
          <button
            className={`nav-btn ${showMarks ? 'active' : ''}`}
            onClick={() => setShowMarks(!showMarks)}
          >
            {t('transactions')}
          </button>
          <button
            className={`nav-btn ${showCalculator ? 'active' : ''}`}
            onClick={() => setShowCalculator(!showCalculator)}
          >
            {t('calculator')}
          </button>
          <button
            className={`nav-btn ${showNotes ? 'active' : ''}`}
            onClick={() => setShowNotes(!showNotes)}
          >
            {t('notes')}
          </button>
          <button className="nav-btn" onClick={() => setShowTemplates(true)}>{t('templates')}</button>
          <button className="nav-btn" onClick={() => setShowHistory(true)}>{t('history')}</button>
          <button className="nav-btn" onClick={() => setShowSettings(true)}>{t('settings')}</button>
          <button className="nav-btn" onClick={() => setShowHelp(true)}>{t('help')}</button>
          <UserMenu />
        </nav>
        <div className="header-right">
          <UserMenu />
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        showMarks={showMarks}
        showCalculator={showCalculator}
        showNotes={showNotes}
        onToggleMarks={() => setShowMarks(!showMarks)}
        onToggleCalculator={() => setShowCalculator(!showCalculator)}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onShowTemplates={() => setShowTemplates(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowHelp={() => setShowHelp(true)}
      />

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
                <p>{t('selectSheet')}</p>
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
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useSettings();

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppProvider userId={user.uid}>
      <AppContent />
    </AppProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
