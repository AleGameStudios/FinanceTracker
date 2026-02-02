import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppData, Sheet, Template, Category, HistoryEntry, Mark, Currency, Balance, DollarBlueRateData, RecurrenceType } from '../types';
import { loadData, saveData, clearData, defaultData, saveBackup, loadBackup, clearBackup, savePendingChanges, loadPendingChanges, clearPendingChanges } from '../utils/storage';
import { getRandomColor } from '../utils/colors';
import { saveUserData, loadUserData, subscribeToUserData, forceSaveUserData } from '../firebase';
import type { AppDataWithMeta } from '../firebase/database';
import type { Unsubscribe } from 'firebase/firestore';

// Helper function to expand recurring marks based on sheet creation date
function expandRecurringMarks(
  templateMarks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[],
  sheetCreatedAt: number,
  categoryIdMap: Map<number, string>,
  balanceIdMap: Map<number, string>
): Mark[] {
  const result: Mark[] = [];
  const sheetDate = new Date(sheetCreatedAt);
  const sheetYear = sheetDate.getFullYear();
  const sheetMonth = sheetDate.getMonth();

  // Get the number of days in the sheet's month
  const daysInMonth = new Date(sheetYear, sheetMonth + 1, 0).getDate();

  for (const mark of templateMarks) {
    // Map categoryId if it's an index reference
    let mappedCategoryId = mark.categoryId;
    if (mark.categoryId?.startsWith('idx:')) {
      const index = parseInt(mark.categoryId.slice(4), 10);
      mappedCategoryId = categoryIdMap.get(index);
    }

    // Map balanceId if it's an index reference
    let mappedBalanceId = mark.balanceId;
    if (mark.balanceId?.startsWith('idx:')) {
      const index = parseInt(mark.balanceId.slice(4), 10);
      mappedBalanceId = balanceIdMap.get(index);
    }

    const recurrence = mark.recurrence || 'one-time';
    const recurrenceDay = mark.recurrenceDay;

    if (recurrence === 'one-time' || !mark.dueDate) {
      // One-time: use the date as-is (or no due date)
      result.push({
        ...mark,
        id: uuidv4(),
        completed: false,
        categoryId: mappedCategoryId,
        balanceId: mappedBalanceId,
      });
    } else if (recurrence === 'monthly') {
      // Monthly: create one mark for that day of the month
      const dayOfMonth = recurrenceDay || new Date(mark.dueDate + 'T00:00:00').getDate();
      // Clamp to valid day in month (e.g., day 31 in a 30-day month becomes day 30)
      const actualDay = Math.min(dayOfMonth, daysInMonth);
      const newDate = new Date(sheetYear, sheetMonth, actualDay);
      const dateStr = newDate.toISOString().split('T')[0];

      result.push({
        ...mark,
        id: uuidv4(),
        completed: false,
        categoryId: mappedCategoryId,
        balanceId: mappedBalanceId,
        dueDate: dateStr,
        recurrence: undefined, // Clear recurrence on expanded marks
        recurrenceDay: undefined,
      });
    } else if (recurrence === 'weekly') {
      // Weekly: create marks for each occurrence of that weekday in the month
      const dayOfWeek = recurrenceDay !== undefined ? recurrenceDay : new Date(mark.dueDate + 'T00:00:00').getDay();

      // Find all occurrences of this weekday in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(sheetYear, sheetMonth, day);
        if (date.getDay() === dayOfWeek) {
          const dateStr = date.toISOString().split('T')[0];
          result.push({
            ...mark,
            id: uuidv4(),
            completed: false,
            categoryId: mappedCategoryId,
            balanceId: mappedBalanceId,
            dueDate: dateStr,
            recurrence: undefined, // Clear recurrence on expanded marks
            recurrenceDay: undefined,
          });
        }
      }
    }
  }

  return result;
}

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'CREATE_SHEET'; payload: { name: string; categories: Omit<Category, 'id'>[]; marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[]; balances: Omit<Balance, 'id'>[] } }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'UPDATE_CATEGORY_AMOUNT'; payload: { categoryId: string; amount: number; note?: string } }
  | { type: 'ADD_CATEGORY'; payload: { name: string; amount: number; color: string; currency: Currency } }
  | { type: 'REMOVE_CATEGORY'; payload: { categoryId: string; note?: string } }
  | { type: 'UPDATE_CATEGORY'; payload: { categoryId: string; name: string; color: string } }
  | { type: 'CREATE_TEMPLATE'; payload: { name: string; categories: Omit<Category, 'id'>[]; marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[]; balances: Omit<Balance, 'id'>[] } }
  | { type: 'UPDATE_TEMPLATE'; payload: { templateId: string; name: string; categories: Omit<Category, 'id'>[]; marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[]; balances: Omit<Balance, 'id'>[] } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'DELETE_SHEET'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppData }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'ADD_MARK'; payload: { name: string; amount: number; markType: 'incoming' | 'outgoing'; currency: Currency; categoryId?: string; balanceId?: string; dueDate?: string } }
  | { type: 'TOGGLE_MARK'; payload: { markId: string } }
  | { type: 'REMOVE_MARK'; payload: { markId: string } }
  | { type: 'UPDATE_CURRENT_BALANCE'; payload: { amount: number } }
  | { type: 'ADD_BALANCE'; payload: { name: string; amount: number; currency: Currency } }
  | { type: 'UPDATE_BALANCE'; payload: { balanceId: string; name: string; amount: number; currency: Currency } }
  | { type: 'REMOVE_BALANCE'; payload: { balanceId: string } }
  | { type: 'UPDATE_NOTES'; payload: string }
  | { type: 'UPDATE_DOLLAR_BLUE_RATE'; payload: number }
  | { type: 'MOVE_MARK'; payload: { markId: string; targetSheetId: string } }
  | { type: 'UPDATE_MARK'; payload: { markId: string; name: string; amount: number; currency: Currency; categoryId?: string; balanceId?: string; dueDate?: string } }
  | { type: 'CONVERT_CATEGORY_CURRENCY'; payload: { categoryId: string; newCurrency: Currency; convertedAmount: number } }
  | { type: 'SET_DOLLAR_BLUE_RATE_DATA'; payload: DollarBlueRateData };

interface AppContextType {
  state: AppData;
  dispatch: React.Dispatch<Action>;
  createSheet: (name: string, categories: Omit<Category, 'id'>[], marks?: Omit<Mark, 'id' | 'completed' | 'completedAt'>[], balances?: Omit<Balance, 'id'>[]) => void;
  setActiveSheet: (sheetId: string) => void;
  updateCategoryAmount: (categoryId: string, amount: number, note?: string) => void;
  addCategory: (name: string, amount: number, color?: string, currency?: Currency) => void;
  removeCategory: (categoryId: string, note?: string) => void;
  updateCategory: (categoryId: string, name: string, color: string) => void;
  createTemplate: (name: string, categories: Omit<Category, 'id'>[], marks?: Omit<Mark, 'id' | 'completed' | 'completedAt'>[], balances?: Omit<Balance, 'id'>[]) => void;
  updateTemplate: (templateId: string, name: string, categories: Omit<Category, 'id'>[], marks?: Omit<Mark, 'id' | 'completed' | 'completedAt'>[], balances?: Omit<Balance, 'id'>[]) => void;
  createTemplateFromSheet: (name: string, sheetId: string) => void;
  deleteTemplate: (templateId: string) => void;
  deleteSheet: (sheetId: string) => void;
  getActiveSheet: () => Sheet | null;
  importData: (data: AppData) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addMark: (name: string, amount: number, markType: 'incoming' | 'outgoing', currency: Currency, categoryId?: string, balanceId?: string, dueDate?: string) => void;
  toggleMark: (markId: string) => void;
  removeMark: (markId: string) => void;
  updateCurrentBalance: (amount: number) => void;
  addBalance: (name: string, amount: number, currency: Currency) => void;
  updateBalance: (balanceId: string, name: string, amount: number, currency: Currency) => void;
  removeBalance: (balanceId: string) => void;
  updateNotes: (notes: string) => void;
  updateDollarBlueRate: (rate: number) => void;
  moveMark: (markId: string, targetSheetId: string) => void;
  updateMark: (markId: string, name: string, amount: number, currency: Currency, categoryId?: string, balanceId?: string, dueDate?: string) => void;
  setDollarBlueRateData: (data: DollarBlueRateData) => void;
  isLoading: boolean;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const appReducer = (state: AppData, action: Action): AppData => {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'CREATE_SHEET': {
      const newSheetId = uuidv4();

      // Create category ID mapping (template index -> new ID)
      const categoryIdMap = new Map<number, string>();
      const newCategories: Category[] = action.payload.categories.map((cat, index) => {
        const newId = uuidv4();
        categoryIdMap.set(index, newId);
        return {
          ...cat,
          id: newId,
          currency: cat.currency || 'USD',
        };
      });

      // Create balance ID mapping (template index -> new ID)
      const balanceIdMap = new Map<number, string>();
      const newBalances: Balance[] = (action.payload.balances || []).map((bal, index) => {
        const newId = uuidv4();
        balanceIdMap.set(index, newId);
        return {
          ...bal,
          id: newId,
        };
      });

      // Create marks with mapped category/balance IDs, expanding recurring marks
      const sheetCreatedAt = Date.now();
      const newMarks: Mark[] = expandRecurringMarks(
        action.payload.marks || [],
        sheetCreatedAt,
        categoryIdMap,
        balanceIdMap
      );

      const newSheet: Sheet = {
        id: newSheetId,
        name: action.payload.name,
        createdAt: sheetCreatedAt,
        categories: newCategories,
        marks: newMarks,
        balances: newBalances,
        isActive: true,
      };

      return {
        ...state,
        sheets: state.sheets.map(s => ({ ...s, isActive: false })).concat(newSheet),
        activeSheetId: newSheetId,
      };
    }

    case 'SET_ACTIVE_SHEET':
      return {
        ...state,
        activeSheetId: action.payload,
        sheets: state.sheets.map(s => ({
          ...s,
          isActive: s.id === action.payload,
        })),
      };

    case 'UPDATE_CATEGORY_AMOUNT': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const category = activeSheet.categories.find(c => c.id === action.payload.categoryId);
      if (!category) return state;

      const historyEntry: HistoryEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        sheetId: activeSheet.id,
        categoryId: category.id,
        categoryName: category.name,
        previousAmount: category.amount,
        newAmount: action.payload.amount,
        changeAmount: action.payload.amount - category.amount,
        note: action.payload.note,
        type: 'adjustment',
      };

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                categories: s.categories.map(c =>
                  c.id === action.payload.categoryId
                    ? { ...c, amount: action.payload.amount }
                    : c
                ),
              }
            : s
        ),
        history: [...state.history, historyEntry],
      };
    }

    case 'ADD_CATEGORY': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const newCategory: Category = {
        id: uuidv4(),
        name: action.payload.name,
        amount: action.payload.amount,
        color: action.payload.color,
        currency: action.payload.currency,
      };

      const historyEntry: HistoryEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        sheetId: activeSheet.id,
        categoryId: newCategory.id,
        categoryName: newCategory.name,
        previousAmount: 0,
        newAmount: newCategory.amount,
        changeAmount: newCategory.amount,
        type: 'category_added',
      };

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, categories: [...s.categories, newCategory] }
            : s
        ),
        history: [...state.history, historyEntry],
      };
    }

    case 'REMOVE_CATEGORY': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const category = activeSheet.categories.find(c => c.id === action.payload.categoryId);
      if (!category) return state;

      const historyEntry: HistoryEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        sheetId: activeSheet.id,
        categoryId: category.id,
        categoryName: category.name,
        previousAmount: category.amount,
        newAmount: 0,
        changeAmount: -category.amount,
        note: action.payload.note,
        type: 'category_removed',
      };

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, categories: s.categories.filter(c => c.id !== action.payload.categoryId) }
            : s
        ),
        history: [...state.history, historyEntry],
      };
    }

    case 'UPDATE_CATEGORY': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                categories: s.categories.map(c =>
                  c.id === action.payload.categoryId
                    ? { ...c, name: action.payload.name, color: action.payload.color }
                    : c
                ),
              }
            : s
        ),
      };
    }

    case 'CREATE_TEMPLATE': {
      const newTemplate: Template = {
        id: uuidv4(),
        name: action.payload.name,
        categories: action.payload.categories,
        marks: action.payload.marks || [],
        balances: action.payload.balances || [],
        createdAt: Date.now(),
      };

      return {
        ...state,
        templates: [...state.templates, newTemplate],
      };
    }

    case 'UPDATE_TEMPLATE': {
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.templateId
            ? {
                ...t,
                name: action.payload.name,
                categories: action.payload.categories,
                marks: action.payload.marks || [],
                balances: action.payload.balances || [],
              }
            : t
        ),
      };
    }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload),
      };

    case 'DELETE_SHEET': {
      const newSheets = state.sheets.filter(s => s.id !== action.payload);
      const newActiveSheetId = state.activeSheetId === action.payload
        ? (newSheets.length > 0 ? newSheets[newSheets.length - 1].id : null)
        : state.activeSheetId;

      return {
        ...state,
        sheets: newSheets.map(s => ({
          ...s,
          isActive: s.id === newActiveSheetId,
        })),
        activeSheetId: newActiveSheetId,
      };
    }

    case 'IMPORT_DATA':
      return action.payload;

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'ADD_MARK': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const newMark: Mark = {
        id: uuidv4(),
        name: action.payload.name,
        amount: action.payload.amount,
        type: action.payload.markType,
        currency: action.payload.currency,
        completed: false,
        categoryId: action.payload.categoryId,
        balanceId: action.payload.balanceId,
        dueDate: action.payload.dueDate,
      };

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, marks: [...(s.marks || []), newMark] }
            : s
        ),
      };
    }

    case 'TOGGLE_MARK': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const mark = activeSheet.marks?.find(m => m.id === action.payload.markId);
      if (!mark) return state;

      const isCompleting = !mark.completed;
      const dollarBlueRate = state.dollarBlueRate || 1200;

      // Calculate amount in USD for category update
      let amountToApply = mark.amount;
      if (mark.currency === 'ARS') {
        amountToApply = mark.amount / dollarBlueRate;
      }

      // For outgoing marks, subtract from category; for incoming, add to category
      // When unchecking (reversing), do the opposite
      const categoryChange = mark.type === 'outgoing'
        ? (isCompleting ? -amountToApply : amountToApply)
        : (isCompleting ? amountToApply : -amountToApply);

      // Calculate balance change with currency conversion if needed
      let balanceAmountToApply = mark.amount;
      if (mark.balanceId) {
        const linkedBalance = activeSheet.balances?.find(b => b.id === mark.balanceId);
        if (linkedBalance && linkedBalance.currency !== mark.currency) {
          // Convert between currencies
          if (mark.currency === 'ARS' && linkedBalance.currency === 'USD') {
            // Mark is ARS, balance is USD - convert ARS to USD
            balanceAmountToApply = mark.amount / dollarBlueRate;
          } else if (mark.currency === 'USD' && linkedBalance.currency === 'ARS') {
            // Mark is USD, balance is ARS - convert USD to ARS
            balanceAmountToApply = mark.amount * dollarBlueRate;
          }
        }
      }
      const balanceChange = mark.type === 'outgoing'
        ? (isCompleting ? -balanceAmountToApply : balanceAmountToApply)
        : (isCompleting ? balanceAmountToApply : -balanceAmountToApply);

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                marks: s.marks?.map(m =>
                  m.id === action.payload.markId
                    ? { ...m, completed: !m.completed, completedAt: !m.completed ? Date.now() : undefined }
                    : m
                ),
                categories: mark.categoryId
                  ? s.categories.map(c =>
                      c.id === mark.categoryId
                        ? { ...c, amount: Math.round((c.amount + categoryChange) * 100) / 100 }
                        : c
                    )
                  : s.categories,
                balances: mark.balanceId
                  ? (s.balances || []).map(b =>
                      b.id === mark.balanceId
                        ? { ...b, amount: Math.round((b.amount + balanceChange) * 100) / 100 }
                        : b
                    )
                  : s.balances,
              }
            : s
        ),
      };
    }

    case 'REMOVE_MARK': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, marks: s.marks?.filter(m => m.id !== action.payload.markId) }
            : s
        ),
      };
    }

    case 'UPDATE_CURRENT_BALANCE': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, currentBalance: action.payload.amount }
            : s
        ),
      };
    }

    case 'ADD_BALANCE': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      const newBalance: Balance = {
        id: uuidv4(),
        name: action.payload.name,
        amount: action.payload.amount,
        currency: action.payload.currency,
      };

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, balances: [...(s.balances || []), newBalance] }
            : s
        ),
      };
    }

    case 'UPDATE_BALANCE': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                balances: (s.balances || []).map(b =>
                  b.id === action.payload.balanceId
                    ? { ...b, name: action.payload.name, amount: action.payload.amount, currency: action.payload.currency }
                    : b
                ),
              }
            : s
        ),
      };
    }

    case 'REMOVE_BALANCE': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? { ...s, balances: (s.balances || []).filter(b => b.id !== action.payload.balanceId) }
            : s
        ),
      };
    }

    case 'UPDATE_NOTES':
      return {
        ...state,
        notes: action.payload,
      };

    case 'UPDATE_DOLLAR_BLUE_RATE':
      return {
        ...state,
        dollarBlueRate: action.payload,
      };

    case 'MOVE_MARK': {
      const sourceSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!sourceSheet) return state;

      const mark = sourceSheet.marks?.find(m => m.id === action.payload.markId);
      if (!mark) return state;

      const targetSheet = state.sheets.find(s => s.id === action.payload.targetSheetId);
      if (!targetSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s => {
          if (s.id === state.activeSheetId) {
            return { ...s, marks: s.marks?.filter(m => m.id !== action.payload.markId) };
          }
          if (s.id === action.payload.targetSheetId) {
            return { ...s, marks: [...(s.marks || []), mark] };
          }
          return s;
        }),
      };
    }

    case 'UPDATE_MARK': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                marks: s.marks?.map(m =>
                  m.id === action.payload.markId
                    ? { ...m, name: action.payload.name, amount: action.payload.amount, currency: action.payload.currency, categoryId: action.payload.categoryId, balanceId: action.payload.balanceId, dueDate: action.payload.dueDate }
                    : m
                ),
              }
            : s
        ),
      };
    }

    case 'CONVERT_CATEGORY_CURRENCY': {
      const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
      if (!activeSheet) return state;

      return {
        ...state,
        sheets: state.sheets.map(s =>
          s.id === state.activeSheetId
            ? {
                ...s,
                categories: s.categories.map(c =>
                  c.id === action.payload.categoryId
                    ? { ...c, currency: action.payload.newCurrency, amount: action.payload.convertedAmount }
                    : c
                ),
              }
            : s
        ),
      };
    }

    case 'SET_DOLLAR_BLUE_RATE_DATA':
      return {
        ...state,
        dollarBlueRate: action.payload.promedio,
        dollarBlueRateData: action.payload,
      };

    default:
      return state;
  }
};

interface AppProviderProps {
  children: ReactNode;
  userId?: string | null;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, userId }) => {
  const [state, dispatch] = useReducer(appReducer, defaultData);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const isInitialLoad = useRef(true);
  const lastSyncedState = useRef<string>('');
  const lastSyncedTimestamp = useRef<number>(0);
  const isSavingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);
  const pendingSaveData = useRef<AppData | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      if (userId) {
        // Load from Firebase for authenticated users
        try {
          const firebaseData = await loadUserData(userId);

          // Check for unsaved backup data that wasn't synced to cloud
          const backup = loadBackup();
          const pendingChanges = loadPendingChanges();

          if (firebaseData) {
            // Extract timestamp and app data
            const { updatedAt, ...appData } = firebaseData as AppDataWithMeta;
            const cloudTimestamp = updatedAt || 0;

            // Check if backup has newer data that wasn't saved to cloud
            if (backup && !backup.savedToCloud && backup.timestamp > cloudTimestamp) {
              console.log('Found unsaved backup data newer than cloud, using backup');
              dispatch({ type: 'LOAD_DATA', payload: backup.data });
              lastSyncedState.current = '';  // Force re-sync
              lastSyncedTimestamp.current = backup.timestamp;
              // Try to save backup to cloud immediately
              try {
                const result = await forceSaveUserData(userId, backup.data);
                if (result) {
                  saveBackup(backup.data, true);  // Mark as saved
                  lastSyncedState.current = JSON.stringify(backup.data);
                  lastSyncedTimestamp.current = result;
                }
              } catch (e) {
                console.error('Failed to sync backup to cloud:', e);
              }
            } else if (pendingChanges && pendingChanges.timestamp > cloudTimestamp) {
              console.log('Found pending changes newer than cloud, using pending data');
              dispatch({ type: 'LOAD_DATA', payload: pendingChanges.data });
              lastSyncedState.current = '';  // Force re-sync
              lastSyncedTimestamp.current = pendingChanges.timestamp;
              // Try to save pending changes to cloud
              try {
                const result = await forceSaveUserData(userId, pendingChanges.data);
                if (result) {
                  clearPendingChanges();
                  lastSyncedState.current = JSON.stringify(pendingChanges.data);
                  lastSyncedTimestamp.current = result;
                }
              } catch (e) {
                console.error('Failed to sync pending changes to cloud:', e);
              }
            } else {
              dispatch({ type: 'LOAD_DATA', payload: appData as AppData });
              lastSyncedState.current = JSON.stringify(appData);
              lastSyncedTimestamp.current = cloudTimestamp || Date.now();
              // Clear backup if cloud data is newer
              clearBackup();
              clearPendingChanges();
            }

            // Clear local storage since we're using cloud data
            clearData();
          } else {
            // First time user - check if they have local data to migrate
            const localData = loadData();
            if (localData.sheets.length > 0) {
              dispatch({ type: 'LOAD_DATA', payload: localData });
              // Force save local data to Firebase (migration)
              const timestamp = await forceSaveUserData(userId, localData);
              lastSyncedState.current = JSON.stringify(localData);
              lastSyncedTimestamp.current = timestamp;
              // Clear local storage after migration
              clearData();
            } else if (backup && !backup.savedToCloud) {
              // Use backup for new users with unsaved data
              dispatch({ type: 'LOAD_DATA', payload: backup.data });
              const timestamp = await forceSaveUserData(userId, backup.data);
              lastSyncedState.current = JSON.stringify(backup.data);
              lastSyncedTimestamp.current = timestamp;
              saveBackup(backup.data, true);
            }
          }
        } catch (error) {
          console.error('Failed to load data from Firebase:', error);
          // Check for backup data on Firebase error
          const backup = loadBackup();
          if (backup) {
            console.log('Using backup data due to Firebase error');
            dispatch({ type: 'LOAD_DATA', payload: backup.data });
          } else {
            console.warn('Using default data due to Firebase error. Please refresh to retry.');
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const localData = loadData();
        dispatch({ type: 'LOAD_DATA', payload: localData });
      }

      setIsLoading(false);
      isInitialLoad.current = false;
    };

    loadInitialData();
  }, [userId]);

  // Subscribe to real-time updates when authenticated
  useEffect(() => {
    if (!userId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Track when subscription first fires to prevent race with initial load
    let subscriptionReady = false;
    const subscriptionReadyTimeout = setTimeout(() => {
      subscriptionReady = true;
    }, 1000); // Wait 1 second after subscription starts before accepting updates

    unsubscribeRef.current = subscribeToUserData(userId, (data, timestamp) => {
      // Skip if this is during initial load, subscription isn't ready, or we're saving
      if (isInitialLoad.current || !subscriptionReady) {
        console.log('Skipping subscription update: initial load or not ready');
        return;
      }

      // Skip if we're currently saving or have pending saves
      if (isSavingRef.current || pendingSaveData.current) {
        console.log('Skipping subscription update: save in progress');
        return;
      }

      if (data && timestamp) {
        // Only update if cloud timestamp is significantly newer (>500ms) than our last synced timestamp
        // This prevents race conditions where our own save triggers an immediate update
        const timeDiff = timestamp - lastSyncedTimestamp.current;
        if (timeDiff > 500) {
          const { updatedAt, ...appData } = data;
          const dataString = JSON.stringify(appData);

          // Only update if data actually changed
          if (dataString !== lastSyncedState.current) {
            console.log('Received newer data from cloud', {
              cloudTimestamp: timestamp,
              localTimestamp: lastSyncedTimestamp.current,
              timeDiff
            });
            dispatch({ type: 'LOAD_DATA', payload: appData as AppData });
            lastSyncedState.current = dataString;
            lastSyncedTimestamp.current = timestamp;
            hasUnsavedChanges.current = false;
            // Clear local backups since we just received fresh cloud data
            clearBackup();
            clearPendingChanges();
          }
        }
      }
    });

    return () => {
      clearTimeout(subscriptionReadyTimeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId]);

  // Perform the actual save to Firebase with verification
  const performSave = useCallback(async (data: AppData): Promise<boolean> => {
    if (!userId) {
      saveData(data);
      return true;
    }

    const dataString = JSON.stringify(data);
    if (dataString === lastSyncedState.current) return true;

    setIsSyncing(true);
    isSavingRef.current = true;

    try {
      // Save backup first before attempting cloud save
      saveBackup(data, false);
      savePendingChanges(data);

      // Use a new timestamp for this save
      const saveTimestamp = Date.now();
      const result = await saveUserData(userId, data, saveTimestamp);

      if (result !== null) {
        // Save succeeded - verify by comparing timestamps
        lastSyncedState.current = dataString;
        lastSyncedTimestamp.current = result;
        hasUnsavedChanges.current = false;

        // Mark backup as saved to cloud
        saveBackup(data, true);
        clearPendingChanges();

        console.log('Save successful, timestamp:', result);
        return true;
      } else {
        // Save was skipped because cloud has newer data
        console.log('Local save skipped - cloud has newer data');
        // Keep backup as unsaved since we didn't actually save
        return false;
      }
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      // Keep backup and pending changes for recovery
      hasUnsavedChanges.current = true;
      return false;
    } finally {
      setIsSyncing(false);
      isSavingRef.current = false;
    }
  }, [userId]);

  // Debounced save function
  const debouncedSave = useCallback((data: AppData) => {
    // Always save backup immediately for safety
    if (userId) {
      saveBackup(data, false);
      savePendingChanges(data);
      hasUnsavedChanges.current = true;
    }

    pendingSaveData.current = data;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save (300ms delay)
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveData.current) {
        performSave(pendingSaveData.current);
        pendingSaveData.current = null;
      }
    }, 300);
  }, [userId, performSave]);

  // Save data on state changes with debouncing
  useEffect(() => {
    if (isInitialLoad.current) return;

    const dataString = JSON.stringify(state);
    if (dataString === lastSyncedState.current) return;

    if (userId) {
      debouncedSave(state);
    } else {
      saveData(state);
    }
  }, [state, userId, debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Beforeunload protection - warn user if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      if (hasUnsavedChanges.current || pendingSaveData.current) {
        // Attempt to force save pending data
        if (pendingSaveData.current && userId) {
          // Save backup synchronously
          saveBackup(pendingSaveData.current, false);
          savePendingChanges(pendingSaveData.current);
        }

        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  const createSheet = (name: string, categories: Omit<Category, 'id'>[], marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] = [], balances: Omit<Balance, 'id'>[] = []) => {
    dispatch({ type: 'CREATE_SHEET', payload: { name, categories, marks, balances } });
  };

  const setActiveSheet = (sheetId: string) => {
    dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheetId });
  };

  const updateCategoryAmount = (categoryId: string, amount: number, note?: string) => {
    dispatch({ type: 'UPDATE_CATEGORY_AMOUNT', payload: { categoryId, amount, note } });
  };

  const addCategory = (name: string, amount: number, color?: string, currency: Currency = 'USD') => {
    dispatch({ type: 'ADD_CATEGORY', payload: { name, amount, color: color || getRandomColor(), currency } });
  };

  const removeCategory = (categoryId: string, note?: string) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: { categoryId, note } });
  };

  const updateCategory = (categoryId: string, name: string, color: string) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { categoryId, name, color } });
  };

  const createTemplate = (name: string, categories: Omit<Category, 'id'>[], marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] = [], balances: Omit<Balance, 'id'>[] = []) => {
    dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories, marks, balances } });
  };

  const updateTemplate = (templateId: string, name: string, categories: Omit<Category, 'id'>[], marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] = [], balances: Omit<Balance, 'id'>[] = []) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { templateId, name, categories, marks, balances } });
  };

  const createTemplateFromSheet = (name: string, sheetId: string) => {
    const sheet = state.sheets.find(s => s.id === sheetId);
    if (sheet) {
      // Create mappings from old IDs to template indices
      const categoryIdToIndex = new Map<string, number>();
      const categories = sheet.categories.map(({ name, amount, color, currency }, index) => {
        categoryIdToIndex.set(sheet.categories[index].id, index);
        return { name, amount, color, currency: currency || 'USD' as const };
      });

      const balanceIdToIndex = new Map<string, number>();
      const balances = (sheet.balances || []).map(({ name, amount, currency }, index) => {
        balanceIdToIndex.set(sheet.balances[index].id, index);
        return { name, amount, currency };
      });

      // Map marks with index references for category/balance links
      const marks = (sheet.marks || []).map(({ name, amount, type, currency, categoryId, balanceId, dueDate }) => ({
        name,
        amount,
        type,
        currency: currency || 'USD' as const,
        categoryId: categoryId ? `idx:${categoryIdToIndex.get(categoryId)}` : undefined,
        balanceId: balanceId ? `idx:${balanceIdToIndex.get(balanceId)}` : undefined,
        dueDate,
      }));

      dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories, marks, balances } });
    }
  };

  const deleteTemplate = (templateId: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
  };

  const deleteSheet = (sheetId: string) => {
    dispatch({ type: 'DELETE_SHEET', payload: sheetId });
  };

  const getActiveSheet = (): Sheet | null => {
    return state.sheets.find(s => s.id === state.activeSheetId) || null;
  };

  const importData = (data: AppData) => {
    dispatch({ type: 'IMPORT_DATA', payload: data });
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const addMark = (name: string, amount: number, markType: 'incoming' | 'outgoing', currency: Currency = 'USD', categoryId?: string, balanceId?: string, dueDate?: string) => {
    dispatch({ type: 'ADD_MARK', payload: { name, amount, markType, currency, categoryId, balanceId, dueDate } });
  };

  const toggleMark = (markId: string) => {
    dispatch({ type: 'TOGGLE_MARK', payload: { markId } });
  };

  const removeMark = (markId: string) => {
    dispatch({ type: 'REMOVE_MARK', payload: { markId } });
  };

  const updateCurrentBalance = (amount: number) => {
    dispatch({ type: 'UPDATE_CURRENT_BALANCE', payload: { amount } });
  };

  const addBalance = (name: string, amount: number, currency: Currency) => {
    dispatch({ type: 'ADD_BALANCE', payload: { name, amount, currency } });
  };

  const updateBalance = (balanceId: string, name: string, amount: number, currency: Currency) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: { balanceId, name, amount, currency } });
  };

  const removeBalance = (balanceId: string) => {
    dispatch({ type: 'REMOVE_BALANCE', payload: { balanceId } });
  };

  const updateNotes = (notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', payload: notes });
  };

  const updateDollarBlueRate = (rate: number) => {
    dispatch({ type: 'UPDATE_DOLLAR_BLUE_RATE', payload: rate });
  };

  const moveMark = (markId: string, targetSheetId: string) => {
    dispatch({ type: 'MOVE_MARK', payload: { markId, targetSheetId } });
  };

  const updateMark = (markId: string, name: string, amount: number, currency: Currency, categoryId?: string, balanceId?: string, dueDate?: string) => {
    dispatch({ type: 'UPDATE_MARK', payload: { markId, name, amount, currency, categoryId, balanceId, dueDate } });
  };

  const setDollarBlueRateData = (data: DollarBlueRateData) => {
    dispatch({ type: 'SET_DOLLAR_BLUE_RATE_DATA', payload: data });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        createSheet,
        setActiveSheet,
        updateCategoryAmount,
        addCategory,
        removeCategory,
        updateCategory,
        createTemplate,
        updateTemplate,
        createTemplateFromSheet,
        deleteTemplate,
        deleteSheet,
        getActiveSheet,
        importData,
        setViewMode,
        addMark,
        toggleMark,
        removeMark,
        updateCurrentBalance,
        addBalance,
        updateBalance,
        removeBalance,
        updateNotes,
        updateDollarBlueRate,
        moveMark,
        updateMark,
        setDollarBlueRateData,
        isLoading,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
