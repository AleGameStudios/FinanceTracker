import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppData, Sheet, Template, Category, HistoryEntry, Mark, Currency, Balance } from '../types';
import { loadData, saveData, defaultData } from '../utils/storage';
import { getRandomColor } from '../utils/colors';
import { saveUserData, loadUserData, subscribeToUserData } from '../firebase';
import type { Unsubscribe } from 'firebase/firestore';

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'CREATE_SHEET'; payload: { name: string; categories: Omit<Category, 'id'>[]; marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] } }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'UPDATE_CATEGORY_AMOUNT'; payload: { categoryId: string; amount: number; note?: string } }
  | { type: 'ADD_CATEGORY'; payload: { name: string; amount: number; color: string; currency: Currency } }
  | { type: 'REMOVE_CATEGORY'; payload: { categoryId: string; note?: string } }
  | { type: 'CREATE_TEMPLATE'; payload: { name: string; categories: Omit<Category, 'id'>[]; marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'DELETE_SHEET'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppData }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'ADD_MARK'; payload: { name: string; amount: number; markType: 'incoming' | 'outgoing'; currency: Currency; categoryId?: string; balanceId?: string } }
  | { type: 'TOGGLE_MARK'; payload: { markId: string } }
  | { type: 'REMOVE_MARK'; payload: { markId: string } }
  | { type: 'UPDATE_CURRENT_BALANCE'; payload: { amount: number } }
  | { type: 'ADD_BALANCE'; payload: { name: string; amount: number; currency: Currency } }
  | { type: 'UPDATE_BALANCE'; payload: { balanceId: string; name: string; amount: number; currency: Currency } }
  | { type: 'REMOVE_BALANCE'; payload: { balanceId: string } }
  | { type: 'UPDATE_NOTES'; payload: string }
  | { type: 'UPDATE_DOLLAR_BLUE_RATE'; payload: number }
  | { type: 'MOVE_MARK'; payload: { markId: string; targetSheetId: string } }
  | { type: 'UPDATE_MARK'; payload: { markId: string; name: string; amount: number; currency: Currency; categoryId?: string; balanceId?: string } }
  | { type: 'CONVERT_CATEGORY_CURRENCY'; payload: { categoryId: string; newCurrency: Currency; convertedAmount: number } };

interface AppContextType {
  state: AppData;
  dispatch: React.Dispatch<Action>;
  createSheet: (name: string, categories: Omit<Category, 'id'>[], marks?: Omit<Mark, 'id' | 'completed' | 'completedAt'>[]) => void;
  setActiveSheet: (sheetId: string) => void;
  updateCategoryAmount: (categoryId: string, amount: number, note?: string) => void;
  addCategory: (name: string, amount: number, color?: string, currency?: Currency) => void;
  removeCategory: (categoryId: string, note?: string) => void;
  createTemplate: (name: string, categories: Omit<Category, 'id'>[], marks?: Omit<Mark, 'id' | 'completed' | 'completedAt'>[]) => void;
  createTemplateFromSheet: (name: string, sheetId: string) => void;
  deleteTemplate: (templateId: string) => void;
  deleteSheet: (sheetId: string) => void;
  getActiveSheet: () => Sheet | null;
  importData: (data: AppData) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addMark: (name: string, amount: number, markType: 'incoming' | 'outgoing', currency: Currency, categoryId?: string, balanceId?: string) => void;
  toggleMark: (markId: string) => void;
  removeMark: (markId: string) => void;
  updateCurrentBalance: (amount: number) => void;
  addBalance: (name: string, amount: number, currency: Currency) => void;
  updateBalance: (balanceId: string, name: string, amount: number, currency: Currency) => void;
  removeBalance: (balanceId: string) => void;
  updateNotes: (notes: string) => void;
  updateDollarBlueRate: (rate: number) => void;
  moveMark: (markId: string, targetSheetId: string) => void;
  updateMark: (markId: string, name: string, amount: number, currency: Currency, categoryId?: string, balanceId?: string) => void;
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
      const newCategories: Category[] = action.payload.categories.map(cat => ({
        ...cat,
        id: uuidv4(),
        currency: cat.currency || 'USD',
      }));

      const newMarks: Mark[] = (action.payload.marks || []).map(mark => ({
        ...mark,
        id: uuidv4(),
        completed: false,
      }));

      const newSheet: Sheet = {
        id: newSheetId,
        name: action.payload.name,
        createdAt: Date.now(),
        categories: newCategories,
        marks: newMarks,
        balances: [],
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

    case 'CREATE_TEMPLATE': {
      const newTemplate: Template = {
        id: uuidv4(),
        name: action.payload.name,
        categories: action.payload.categories,
        marks: action.payload.marks || [],
        createdAt: Date.now(),
      };

      return {
        ...state,
        templates: [...state.templates, newTemplate],
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

      // Balance change is in the mark's currency (no conversion needed)
      const balanceChange = mark.type === 'outgoing'
        ? (isCompleting ? -mark.amount : mark.amount)
        : (isCompleting ? mark.amount : -mark.amount);

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
                    ? { ...m, name: action.payload.name, amount: action.payload.amount, currency: action.payload.currency, categoryId: action.payload.categoryId, balanceId: action.payload.balanceId }
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

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      if (userId) {
        // Load from Firebase for authenticated users
        try {
          const firebaseData = await loadUserData(userId);
          if (firebaseData) {
            dispatch({ type: 'LOAD_DATA', payload: firebaseData });
            lastSyncedState.current = JSON.stringify(firebaseData);
          } else {
            // First time user - check if they have local data to migrate
            const localData = loadData();
            if (localData.sheets.length > 0) {
              dispatch({ type: 'LOAD_DATA', payload: localData });
              // Save local data to Firebase
              await saveUserData(userId, localData);
              lastSyncedState.current = JSON.stringify(localData);
            }
          }
        } catch (error) {
          console.error('Failed to load data from Firebase:', error);
          // Fall back to local storage
          const localData = loadData();
          dispatch({ type: 'LOAD_DATA', payload: localData });
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

    unsubscribeRef.current = subscribeToUserData(userId, (data) => {
      if (data && !isInitialLoad.current) {
        const dataString = JSON.stringify(data);
        // Only update if data actually changed from another source
        if (dataString !== lastSyncedState.current) {
          dispatch({ type: 'LOAD_DATA', payload: data });
          lastSyncedState.current = dataString;
        }
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId]);

  // Save data on state changes
  const saveDataToStorage = useCallback(async (data: AppData) => {
    if (isInitialLoad.current) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastSyncedState.current) return;

    if (userId) {
      setIsSyncing(true);
      try {
        await saveUserData(userId, data);
        lastSyncedState.current = dataString;
      } catch (error) {
        console.error('Failed to save to Firebase:', error);
      } finally {
        setIsSyncing(false);
      }
    } else {
      saveData(data);
    }
  }, [userId]);

  useEffect(() => {
    saveDataToStorage(state);
  }, [state, saveDataToStorage]);

  const createSheet = (name: string, categories: Omit<Category, 'id'>[], marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] = []) => {
    dispatch({ type: 'CREATE_SHEET', payload: { name, categories, marks } });
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

  const createTemplate = (name: string, categories: Omit<Category, 'id'>[], marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[] = []) => {
    dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories, marks } });
  };

  const createTemplateFromSheet = (name: string, sheetId: string) => {
    const sheet = state.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const categories = sheet.categories.map(({ name, amount, color }) => ({ name, amount, color }));
      const marks = (sheet.marks || []).map(({ name, amount, type, currency }) => ({ name, amount, type, currency: currency || 'USD' as const }));
      dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories, marks } });
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

  const addMark = (name: string, amount: number, markType: 'incoming' | 'outgoing', currency: Currency = 'USD', categoryId?: string, balanceId?: string) => {
    dispatch({ type: 'ADD_MARK', payload: { name, amount, markType, currency, categoryId, balanceId } });
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

  const updateMark = (markId: string, name: string, amount: number, currency: Currency, categoryId?: string, balanceId?: string) => {
    dispatch({ type: 'UPDATE_MARK', payload: { markId, name, amount, currency, categoryId, balanceId } });
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
        createTemplate,
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
