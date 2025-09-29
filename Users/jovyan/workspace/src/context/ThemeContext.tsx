
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with a placeholder or null, the effect will set the correct one.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // The source of truth is the class set by the inline script in layout.tsx.
    // This runs once on component mount.
    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Also update localStorage so manual toggles are remembered across sessions
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      return newTheme;
    });
  }, []);

  // useMemo will re-calculate the value only when `theme` changes.
  const value = useMemo(() => ({ 
    theme: theme || 'light', // Provide a fallback for the initial render before effect runs
    toggleTheme 
  }), [theme, toggleTheme]);

  // Render children only when the theme has been determined to avoid flash of unstyled content
  return theme ? (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  ) : null;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
