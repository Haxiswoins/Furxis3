
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light'); // This default is temporary and will be updated by useEffect

  useEffect(() => {
    // The theme is initialized in <html> by ThemeInitializer before this component mounts.
    // This effect ensures React state is in sync with the DOM and handles user overrides.

    const storedTheme = localStorage.getItem('theme') as Theme;

    let initialTheme: Theme;

    if (storedTheme) {
      // 1. User has manually set a theme, respect it.
      initialTheme = storedTheme;
    } else {
      // 2. No manual override, use the theme set by the server (ThemeInitializer).
      initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    setTheme(initialTheme);
    // Ensure the class is correctly set, especially if localStorage was used.
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // When user toggles, store it as a manual override.
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      return newTheme;
    });
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
