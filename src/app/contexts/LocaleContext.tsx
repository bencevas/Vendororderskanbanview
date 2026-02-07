import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, TranslationKey, Locale } from '../i18n/translations';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app_locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('hu'); // Default to Hungarian
  const { user } = useAuth();

  // Load locale on mount
  useEffect(() => {
    const loadLocale = async () => {
      // If user is logged in and Supabase is configured, try to get their locale
      if (user && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('locale')
            .eq('email', user.email)
            .single();

          if (data?.locale && !error) {
            setLocaleState(data.locale as Locale);
            return;
          }
        } catch (err) {
          console.warn('Error fetching user locale:', err);
        }
      }

      // Fall back to localStorage for guests or if Supabase fetch fails
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (storedLocale === 'en' || storedLocale === 'hu') {
        setLocaleState(storedLocale);
      }
    };

    loadLocale();
  }, [user]);

  // Update locale (saves to Supabase for logged-in users, localStorage for guests)
  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    // If user is logged in and Supabase is configured, update their profile
    if (user && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ locale: newLocale })
          .eq('email', user.email);

        if (error) {
          console.warn('Error updating user locale in Supabase:', error);
        }
      } catch (err) {
        console.warn('Error updating locale:', err);
      }
    }
  }, [user]);

  // Translation function
  const t = useCallback((key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Re-export types for convenience
export type { Locale, TranslationKey };
