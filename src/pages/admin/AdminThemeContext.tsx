import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
  toggleTheme: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('admin-theme');
    if (saved === 'light' || saved === 'dark') setThemeState(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('admin-theme', theme);
    document.documentElement.dataset.adminTheme = theme;
  }, [theme]);

  const value = useMemo<AdminThemeContextValue>(() => {
    return {
      theme,
      setTheme: (t) => setThemeState(t),
      toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    };
  }, [theme]);

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

export const useAdminTheme = (): AdminThemeContextValue => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return ctx;
};

