
'use client';

import React, { createContext, useContext } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // This hook is simplified to just read from the DOM, as the initial script
  // in RootLayout is the source of truth on initial load.
  const theme: Theme | null =
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('light')
        ? 'light'
        : 'dark'
      : null; // Return null on the server.

  return (
    <ThemeContext.Provider value={{ theme }}>
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
