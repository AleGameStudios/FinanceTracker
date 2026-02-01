import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { translations } from '../i18n';
import type { Language, TranslationKey } from '../i18n';

export type Theme = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  accent: string;
}

const defaultPalette: ColorPalette = {
  primary: '#4f46e5',
  accent: '#22c55e',
};

const palettePresets: { name: string; colors: ColorPalette }[] = [
  { name: 'Indigo', colors: { primary: '#4f46e5', accent: '#22c55e' } },
  { name: 'Blue', colors: { primary: '#2563eb', accent: '#f59e0b' } },
  { name: 'Purple', colors: { primary: '#7c3aed', accent: '#ec4899' } },
  { name: 'Teal', colors: { primary: '#0d9488', accent: '#f97316' } },
  { name: 'Rose', colors: { primary: '#e11d48', accent: '#06b6d4' } },
  { name: 'Emerald', colors: { primary: '#059669', accent: '#8b5cf6' } },
];

interface SettingsContextType {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';

  // Language
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;

  // Color Palette
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  palettePresets: typeof palettePresets;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_STORAGE_KEY = 'finance-tracker-settings';

interface StoredSettings {
  theme: Theme;
  language: Language;
  palette: ColorPalette;
}

const loadSettings = (): StoredSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return {
    theme: 'system',
    language: 'en',
    palette: defaultPalette,
  };
};

const saveSettings = (settings: StoredSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => loadSettings().theme);
  const [language, setLanguageState] = useState<Language>(() => loadSettings().language);
  const [palette, setPaletteState] = useState<ColorPalette>(() => loadSettings().palette);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Resolve system theme
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Apply color palette as CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', palette.primary);
    document.documentElement.style.setProperty('--accent-color', palette.accent);

    // Calculate hover color (slightly darker)
    const darken = (hex: string, percent: number) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max((num >> 16) - amt, 0);
      const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
      const B = Math.max((num & 0x0000FF) - amt, 0);
      return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    };

    document.documentElement.style.setProperty('--primary-hover', darken(palette.primary, 10));
  }, [palette]);

  // Save settings on change
  useEffect(() => {
    saveSettings({ theme, language, palette });
  }, [theme, language, palette]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
  }, []);

  const setPalette = useCallback((newPalette: ColorPalette) => {
    setPaletteState(newPalette);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        language,
        setLanguage,
        t,
        palette,
        setPalette,
        palettePresets,
        isMobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
