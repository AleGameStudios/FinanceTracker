export interface Category {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  sheetId: string;
  categoryId: string;
  categoryName: string;
  previousAmount: number;
  newAmount: number;
  changeAmount: number;
  note?: string;
  type: 'adjustment' | 'initial' | 'sheet_created' | 'category_added' | 'category_removed';
}

export interface Sheet {
  id: string;
  name: string;
  createdAt: number;
  categories: Category[];
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  categories: Omit<Category, 'id'>[];
  createdAt: number;
}

export interface AppData {
  sheets: Sheet[];
  templates: Template[];
  history: HistoryEntry[];
  activeSheetId: string | null;
}
