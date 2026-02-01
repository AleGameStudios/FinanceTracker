export interface Category {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export type Currency = 'USD' | 'ARS';

export interface Mark {
  id: string;
  name: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  currency: Currency;
  completed: boolean;
  completedAt?: number;
  categoryId?: string;
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
  type: 'adjustment' | 'initial' | 'sheet_created' | 'category_added' | 'category_removed' | 'mark_completed' | 'mark_added' | 'mark_removed';
}

export interface Sheet {
  id: string;
  name: string;
  createdAt: number;
  categories: Category[];
  marks: Mark[];
  isActive: boolean;
  currentBalance?: number;
}

export interface Template {
  id: string;
  name: string;
  categories: Omit<Category, 'id'>[];
  marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[];
  createdAt: number;
}

export interface AppData {
  sheets: Sheet[];
  templates: Template[];
  history: HistoryEntry[];
  activeSheetId: string | null;
  viewMode: 'grid' | 'list';
  notes: string;
  dollarBlueRate: number;
}
