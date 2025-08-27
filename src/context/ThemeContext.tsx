
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
  // Initialize theme to null to avoid hydration mismatch.
  // The actual theme will be set on the client after mount.
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
    // This function will only run on the client, so window is safe to use.
    if (!siteContent) return; // Wait until site content is loaded

    const sunriseHour = siteContent?.sunriseHour ?? 6;
    const sunsetHour = siteContent?.sunsetHour ?? 18;

    const now = new Date();
    const currentHour = now.getHours();
    
    const newTheme = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 'light' : 'dark';
    
    setTheme(newTheme);

  }, [siteContent]); 

  // Run theme determination once on mount and then on an interval.
  useEffect(() => {
    determineTheme();
    const interval = setInterval(determineTheme, 60000);
    return () => clearInterval(interval);
  }, [determineTheme]);

  // Apply the theme class to the document root when theme state changes.
  useEffect(() => {
    if (theme) {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }
  }, [theme]);
  
  // Render children, but provide a default 'dark' theme value
  // to prevent errors in consuming components before the client-side theme is determined.
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
