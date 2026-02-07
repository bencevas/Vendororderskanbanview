import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale, Locale } from '../../contexts/LocaleContext';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Globe } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
  onModeChange?: (isSignUp: boolean) => void;
  showLocaleSelector?: boolean;
}

export function LoginForm({ onSuccess, defaultMode = 'login', onModeChange, showLocaleSelector = false }: LoginFormProps) {
  const { signIn, signUp, isConfigured } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'register');
  
  // Set Hungarian as default locale when in register mode
  useEffect(() => {
    if (isSignUp && showLocaleSelector && locale !== 'hu') {
      setLocale('hu');
    }
  }, [isSignUp, showLocaleSelector]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{t('supabaseNotConfigured')}</span>
        </div>
        <p className="text-sm">
          {t('createEnvFile')}{' '}
          <code className="bg-amber-100 px-1 rounded">.env.local</code> {t('fileWith')}:
        </p>
        <pre className="mt-2 text-xs bg-amber-100 p-2 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setError(null);
          onSuccess?.();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setError(null);
          onSuccess?.();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isSignUp ? t('createAccount') : t('welcome')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isSignUp
              ? t('signInToManage')
              : t('signInToManage')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#EA776C]/10 dark:bg-[#EA776C]/20 border border-[#EA776C]/30 dark:border-[#EA776C]/40 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#EA776C] flex-shrink-0" />
            <p className="text-sm text-[#EA776C]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field (sign up only) */}
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignUp}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#476a30] focus:border-[#476a30] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#476a30] focus:border-[#476a30] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#476a30] hover:bg-[#3d5a28] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignUp ? t('creatingAccount') : t('signingIn')}
              </>
            ) : (
              <>{isSignUp ? t('createAccount') : t('signIn')}</>
            )}
          </button>
        </form>

        {/* Toggle sign up / sign in */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? t('haveAccount') : t('noAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  onModeChange?.(!isSignUp);
                }}
                className="text-[#476a30] dark:text-[#5a8a3f] hover:text-[#3d5a28] dark:hover:text-[#4a7a35] font-medium"
              >
                {isSignUp ? t('signIn') : t('createAccount')}
              </button>
          </p>
        </div>

        {/* Locale Selector - shown in register mode */}
        {isSignUp && showLocaleSelector && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('language')}
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
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
                type="button"
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
        )}
    </div>
  );
}
