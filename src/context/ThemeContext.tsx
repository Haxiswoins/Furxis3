
'use client';

import React, { createContext, useContext, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme] = useState<Theme | null>(() => {
    // This now runs only once on the client, reading the class set by the inline script.
    if (typeof window === 'undefined') {
      return null; // On the server, we don't know the theme.
    }
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });

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
