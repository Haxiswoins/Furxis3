
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SiteContent } from '@/types';
import { getSiteContent } from '@/lib/data-service';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme | null>(() => {
    // Read the theme from the DOM on initial client-side render.
    // This avoids the flash because the class is already set by the inline script.
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return null;
  });
  
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
    
    if (newTheme !== theme) {
      setTheme(newTheme);
    }

  }, [siteContent, theme]); 

  // Run theme determination on mount and then on an interval.
  useEffect(() => {
    // We already set the theme from the DOM, so this just sets up the interval for updates.
    const interval = setInterval(determineTheme, 60000);
    return () => clearInterval(interval);
  }, [determineTheme]);

  // Apply the theme class to the document root when theme state changes.
  useEffect(() => {
    if (theme) {
        const root = window.document.documentElement;
        if (!root.classList.contains(theme)) {
             root.classList.remove('light', 'dark');
             root.classList.add(theme);
        }
    }
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
