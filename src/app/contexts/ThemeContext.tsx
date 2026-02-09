import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  // Legacy API for compatibility
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';
const THEME_PREFERENCE_KEY = 'app_theme_preference';

// Helper to get theme based on time of day
// Light mode: 6:00 AM - 5:59 PM (6-17)
// Dark mode: 6:00 PM - 5:59 AM (18-5)
function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

// Helper to get system preference
function getSystemPreference(): Theme | null {
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return null;
}

// Resolve auto preference to actual theme
// Priority: System preference > Time-based
function resolveAutoTheme(): Theme {
  const systemPref = getSystemPreference();
  if (systemPref) {
    return systemPref;
  }
  return getTimeBasedTheme();
}

// Get the effective theme based on preference
function getEffectiveTheme(preference: ThemePreference): Theme {
  if (preference === 'auto') {
    return resolveAutoTheme();
  }
  return preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Load preference from storage or default to 'auto'
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'auto';
    
    // Check for new preference key first
    const storedPreference = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'auto') {
      return storedPreference;
    }
    
    // Check legacy theme key for migration
    const legacyTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (legacyTheme === 'light' || legacyTheme === 'dark') {
      // Migrate to new preference system but keep the manual selection
      return legacyTheme;
    }
    
    // Default to auto for new users
    return 'auto';
  });

  // Compute the actual theme from preference
  const [theme, setThemeState] = useState<Theme>(() => {
    return getEffectiveTheme(themePreference);
  });

  // Apply theme class to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Update theme when preference changes
  useEffect(() => {
    const newTheme = getEffectiveTheme(themePreference);
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Persist preference
    localStorage.setItem(THEME_PREFERENCE_KEY, themePreference);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme); // Keep legacy key in sync
  }, [themePreference, applyTheme]);

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (themePreference !== 'auto') return;
    
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handleChange = () => {
      const newTheme = resolveAutoTheme();
      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference, applyTheme]);

  // Update theme periodically when in auto mode (for time-based switching)
  useEffect(() => {
    if (themePreference !== 'auto') return;
    
    // Only set up interval if system preference is not available
    const systemPref = getSystemPreference();
    if (systemPref) return; // System preference takes priority, no need for time check
    
    // Check every minute for time-based changes
    const interval = setInterval(() => {
      const newTheme = getTimeBasedTheme();
      if (newTheme !== theme) {
        setThemeState(newTheme);
        applyTheme(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [themePreference, theme, applyTheme]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
  }, []);

  // Legacy API: setting theme directly sets preference to that specific theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemePreferenceState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference, setTheme }}>
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

