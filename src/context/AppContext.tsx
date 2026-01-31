import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppData, Sheet, Template, Category, HistoryEntry } from '../types';
import { loadData, saveData } from '../utils/storage';
import { getRandomColor } from '../utils/colors';

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'CREATE_SHEET'; payload: { name: string; categories: Omit<Category, 'id'>[] } }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'UPDATE_CATEGORY_AMOUNT'; payload: { categoryId: string; amount: number; note?: string } }
  | { type: 'ADD_CATEGORY'; payload: { name: string; amount: number; color: string } }
  | { type: 'REMOVE_CATEGORY'; payload: { categoryId: string; note?: string } }
  | { type: 'CREATE_TEMPLATE'; payload: { name: string; categories: Omit<Category, 'id'>[] } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'DELETE_SHEET'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppData };

const AppContext = createContext<{
  state: AppData;
  dispatch: React.Dispatch<Action>;
  createSheet: (name: string, categories: Omit<Category, 'id'>[]) => void;
  setActiveSheet: (sheetId: string) => void;
  updateCategoryAmount: (categoryId: string, amount: number, note?: string) => void;
  addCategory: (name: string, amount: number, color?: string) => void;
  removeCategory: (categoryId: string, note?: string) => void;
  createTemplate: (name: string, categories: Omit<Category, 'id'>[]) => void;
  createTemplateFromSheet: (name: string, sheetId: string) => void;
  deleteTemplate: (templateId: string) => void;
  deleteSheet: (sheetId: string) => void;
  getActiveSheet: () => Sheet | null;
  importData: (data: AppData) => void;
} | null>(null);

const appReducer = (state: AppData, action: Action): AppData => {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'CREATE_SHEET': {
      const newSheetId = uuidv4();
      const newCategories: Category[] = action.payload.categories.map(cat => ({
        ...cat,
        id: uuidv4(),
      }));

      const historyEntries: HistoryEntry[] = [
        {
          id: uuidv4(),
          timestamp: Date.now(),
          sheetId: newSheetId,
          categoryId: '',
          categoryName: '',
          previousAmount: 0,
          newAmount: 0,
          changeAmount: 0,
          type: 'sheet_created',
        },
        ...newCategories.map(cat => ({
          id: uuidv4(),
          timestamp: Date.now(),
          sheetId: newSheetId,
          categoryId: cat.id,
          categoryName: cat.name,
          previousAmount: 0,
          newAmount: cat.amount,
          changeAmount: cat.amount,
          type: 'initial' as const,
        })),
      ];

      const newSheet: Sheet = {
        id: newSheetId,
        name: action.payload.name,
        createdAt: Date.now(),
        categories: newCategories,
        isActive: true,
      };

      return {
        ...state,
        sheets: state.sheets.map(s => ({ ...s, isActive: false })).concat(newSheet),
        activeSheetId: newSheetId,
        history: [...state.history, ...historyEntries],
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

    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, loadData());

  useEffect(() => {
    saveData(state);
  }, [state]);

  const createSheet = (name: string, categories: Omit<Category, 'id'>[]) => {
    dispatch({ type: 'CREATE_SHEET', payload: { name, categories } });
  };

  const setActiveSheet = (sheetId: string) => {
    dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheetId });
  };

  const updateCategoryAmount = (categoryId: string, amount: number, note?: string) => {
    dispatch({ type: 'UPDATE_CATEGORY_AMOUNT', payload: { categoryId, amount, note } });
  };

  const addCategory = (name: string, amount: number, color?: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { name, amount, color: color || getRandomColor() } });
  };

  const removeCategory = (categoryId: string, note?: string) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: { categoryId, note } });
  };

  const createTemplate = (name: string, categories: Omit<Category, 'id'>[]) => {
    dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories } });
  };

  const createTemplateFromSheet = (name: string, sheetId: string) => {
    const sheet = state.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const categories = sheet.categories.map(({ name, amount, color }) => ({ name, amount, color }));
      dispatch({ type: 'CREATE_TEMPLATE', payload: { name, categories } });
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
