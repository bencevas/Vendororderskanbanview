import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale, Locale } from '../../contexts/LocaleContext';
import { LoginForm } from './LoginForm';
import { Globe } from 'lucide-react';

export function AuthScreen() {
  const { isConfigured } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-amber-800 dark:text-amber-200">Supabase not configured</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please configure Supabase to enable authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('orderManagement')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? t('createAccount') : t('signInToManage')}
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
            {t('language')}
          </label>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setLocale('hu')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                locale === 'hu'
                  ? 'bg-[#476a30] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              🇭🇺 Magyar
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`flex-1 px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center gap-2 ${
                locale === 'en'
                  ? 'bg-[#476a30] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Login/Register Form */}
        <LoginForm 
          onSuccess={() => {}} 
          defaultMode={isSignUp ? 'register' : 'login'}
          onModeChange={setIsSignUp}
          showLocaleSelector={isSignUp}
        />
      </div>
    </div>
  );
}

