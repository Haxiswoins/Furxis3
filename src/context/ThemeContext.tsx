
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SiteContent } from '@/types';
import { getSiteContent } from '@/lib/data-service';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark'); 
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    async function fetchSiteContent() {
        try {
            const data = await getSiteContent();
            setSiteContent(data);
        } catch (error) {
            console.error("Error fetching site content:", error);
        }
    }
    fetchSiteContent();
  }, []);

  const determineTheme = useCallback(() => {
    // Use default hours if siteContent is not yet loaded or doesn't have the properties
    const sunriseHour = siteContent?.sunriseHour ?? 6;
    const sunsetHour = siteContent?.sunsetHour ?? 18;

    const now = new Date();
    const currentHour = now.getHours();
    
    const newTheme = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 'light' : 'dark';
    
    setTheme(prevTheme => {
      if (prevTheme !== newTheme) {
        return newTheme;
      }
      return prevTheme;
    });

  }, [siteContent]); 

  useEffect(() => {
    determineTheme();
    const interval = setInterval(determineTheme, 60000);
    return () => clearInterval(interval);
  }, [determineTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

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
