import type { AppData } from '../types';

const STORAGE_KEY = 'finance-tracker-data';
const BACKUP_KEY = 'finance-tracker-backup';
const PENDING_CHANGES_KEY = 'finance-tracker-pending';

export const defaultData: AppData = {
  sheets: [],
  templates: [],
  history: [],
  activeSheetId: null,
  viewMode: 'grid',
  notes: '',
  dollarBlueRate: 1200, // Default rate, user should update
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Migrate old data to include new fields
      return {
        ...defaultData,
        ...data,
        sheets: data.sheets?.map((s: any) => ({
          ...s,
          marks: (s.marks || []).map((m: any) => ({
            ...m,
            currency: m.currency || 'USD', // Default to USD for existing marks
          })),
        })) || [],
        templates: data.templates?.map((t: any) => ({
          ...t,
          marks: (t.marks || []).map((m: any) => ({
            ...m,
            currency: m.currency || 'USD',
          })),
        })) || [],
        viewMode: data.viewMode || 'grid',
        notes: data.notes || '',
        dollarBlueRate: data.dollarBlueRate || 1200,
      };
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return defaultData;
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

export const clearData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
};

export const exportData = (data: AppData): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Backup functions for failsafe saving
export interface BackupData {
  data: AppData;
  timestamp: number;
  savedToCloud: boolean;
}

export const saveBackup = (data: AppData, savedToCloud: boolean = false): void => {
  try {
    const backup: BackupData = {
      data,
      timestamp: Date.now(),
      savedToCloud,
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch (error) {
    console.error('Failed to save backup to localStorage:', error);
  }
};

export const loadBackup = (): BackupData | null => {
  try {
    const stored = localStorage.getItem(BACKUP_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load backup from localStorage:', error);
  }
  return null;
};

export const clearBackup = (): void => {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear backup from localStorage:', error);
  }
};

// Pending changes queue for debounced saving
export interface PendingChange {
  data: AppData;
  timestamp: number;
}

export const savePendingChanges = (data: AppData): void => {
  try {
    const pending: PendingChange = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to save pending changes:', error);
  }
};

export const loadPendingChanges = (): PendingChange | null => {
  try {
    const stored = localStorage.getItem(PENDING_CHANGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load pending changes:', error);
  }
  return null;
};

export const clearPendingChanges = (): void => {
  try {
    localStorage.removeItem(PENDING_CHANGES_KEY);
  } catch (error) {
    console.error('Failed to clear pending changes:', error);
  }
};
