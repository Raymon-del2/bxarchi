'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

type Theme = 'light' | 'dark' | 'sepia' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');

  // Load theme from user settings
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        // Load from localStorage for non-logged in users
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large';
        if (savedTheme) setThemeState(savedTheme);
        if (savedFontSize) setFontSizeState(savedFontSize);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userTheme = data.theme || 'light';
          const userFontSize = data.fontSize || 'medium';
          
          // Handle auto theme
          if (userTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setThemeState(prefersDark ? 'dark' : 'light');
          } else {
            setThemeState(userTheme);
          }
          
          setFontSizeState(userFontSize);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
  }, [theme, fontSize]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setFontSize = (newSize: 'small' | 'medium' | 'large') => {
    setFontSizeState(newSize);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
