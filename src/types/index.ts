export type Currency = 'USD' | 'ARS';

export interface Category {
  id: string;
  name: string;
  amount: number;
  color: string;
  currency: Currency;
}

export interface Balance {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
}

export interface Tracker {
  id: string;
  name: string;
  color: string;
  currency: Currency;
  // Trackers always start at 0 and accumulate from completed transactions
}

export type RecurrenceType = 'one-time' | 'weekly' | 'monthly';

export interface Mark {
  id: string;
  name: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  currency: Currency;
  completed: boolean;
  completedAt?: number;
  categoryId?: string;
  balanceId?: string; // Link to a specific balance
  trackerId?: string; // Link to a tracker (spending tracker)
  dueDate?: string; // ISO date string (YYYY-MM-DD) for calendar display
  recurrence?: RecurrenceType; // How the due date recurs when creating from template
  recurrenceDay?: number; // Day of month (1-31) for monthly, or day of week (0-6, Sun-Sat) for weekly
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
  balances: Balance[];
  trackers: Tracker[];
  isActive: boolean;
  currentBalance?: number; // Deprecated: kept for backwards compatibility
}

export interface Template {
  id: string;
  name: string;
  categories: Omit<Category, 'id'>[];
  marks: Omit<Mark, 'id' | 'completed' | 'completedAt'>[];
  balances: Omit<Balance, 'id'>[];
  trackers: Omit<Tracker, 'id'>[];
  createdAt: number;
}

export interface DollarBlueRateData {
  compra: number;
  venta: number;
  promedio: number;
  lastUpdated: number; // timestamp
  sources: { name: string; compra: number; venta: number }[];
}

export interface AppData {
  sheets: Sheet[];
  templates: Template[];
  history: HistoryEntry[];
  activeSheetId: string | null;
  viewMode: 'grid' | 'list';
  notes: string;
  dollarBlueRate: number;
  dollarBlueRateData?: DollarBlueRateData; // Auto-fetched rate data
}
