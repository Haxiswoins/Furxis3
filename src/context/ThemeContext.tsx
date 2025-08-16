
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SiteContent } from '@/types';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark, will be updated
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    // Fetch site content from the new API endpoint
    async function fetchSiteContent() {
        try {
            const response = await fetch('/api/site-content');
            if (!response.ok) {
                throw new Error('Failed to fetch site content');
            }
            const data: SiteContent = await response.json();
            setSiteContent(data);
        } catch (error) {
            console.error("Error fetching site content:", error);
        }
    }
    fetchSiteContent();
  }, []);

  const determineTheme = useCallback(() => {
    // Use defaults if site content is not yet loaded
    const sunriseHour = siteContent?.sunriseHour ?? 6;
    const sunsetHour = siteContent?.sunsetHour ?? 18;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Theme is 'light' if current hour is between sunrise and sunset
    const newTheme = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 'light' : 'dark';

    setTheme(prevTheme => {
      if (prevTheme !== newTheme) {
        return newTheme;
      }
      return prevTheme;
    });

  }, [siteContent]);

  useEffect(() => {
    // Determine theme immediately when siteContent is available or on initial load
    determineTheme();

    // Re-check theme every minute
    const interval = setInterval(determineTheme, 60000);
    
    return () => clearInterval(interval);
  }, [determineTheme]); // Re-run this effect when siteContent changes

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
