
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
  const [theme, setTheme] = useState<Theme | null>(null);
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
    if (!siteContent) return; 

    const sunriseHour = siteContent?.sunriseHour ?? 6;
    const sunsetHour = siteContent?.sunsetHour ?? 18;

    const now = new Date();
    const currentHour = now.getHours();
    
    const newTheme = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 'light' : 'dark';
    
    setTheme(newTheme);

  }, [siteContent]); 

  useEffect(() => {
    determineTheme();
    const interval = setInterval(determineTheme, 60000);
    return () => clearInterval(interval);
  }, [determineTheme]);

  useEffect(() => {
    if (theme) {
        const root = window.document.documentElement;
        const isThemeSet = root.classList.contains('light') || root.classList.contains('dark');
        const currentThemeOnDoc = root.classList.contains('dark') ? 'dark' : 'light';

        // Only reload if the theme has been set before and is changing
        if (isThemeSet && currentThemeOnDoc !== theme) {
            // Add the new theme class before reloading to avoid a flash of unstyled content
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            window.location.reload();
        } else if (!isThemeSet) {
             root.classList.remove('light', 'dark');
             root.classList.add(theme);
        }
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme: theme || 'dark' }}>
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
