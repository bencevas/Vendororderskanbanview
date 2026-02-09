import { X, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { useLocale, Locale } from '@/app/contexts/LocaleContext';
import { useTheme } from '@/app/contexts/ThemeContext';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { locale, setLocale, t } = useLocale();
  const { theme, themePreference, setThemePreference } = useTheme();

  const handleLocaleChange = async (newLocale: Locale) => {
    await setLocale(newLocale);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('settingsTitle')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Language Setting */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('language')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {locale === 'hu' ? 'Magyar' : 'English'}
                </p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => handleLocaleChange('hu')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  locale === 'hu'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                🇭🇺 Magyar
              </button>
              <button
                onClick={() => handleLocaleChange('en')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${
                  locale === 'en'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Theme Setting */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                {themePreference === 'auto' ? (
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('theme')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {themePreference === 'auto' 
                    ? t('auto') 
                    : themePreference === 'dark' 
                      ? t('dark') 
                      : t('light')}
                </p>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setThemePreference('light')}
                className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  themePreference === 'light'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                {t('light')}
              </button>
              <button
                onClick={() => setThemePreference('auto')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-1.5 ${
                  themePreference === 'auto'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
                {t('auto')}
              </button>
              <button
                onClick={() => setThemePreference('dark')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-1.5 ${
                  themePreference === 'dark'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                {t('dark')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#476a30] text-white rounded-lg hover:bg-[#3d5a28] transition-colors"
          >
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
}
