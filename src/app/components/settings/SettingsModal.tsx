import { X, Globe } from 'lucide-react';
import { useLocale, Locale } from '@/app/contexts/LocaleContext';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { locale, setLocale, t } = useLocale();

  const handleLocaleChange = async (newLocale: Locale) => {
    await setLocale(newLocale);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('settingsTitle')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Language Setting */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('language')}</p>
                <p className="text-sm text-gray-500">
                  {locale === 'hu' ? 'Magyar' : 'English'}
                </p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => handleLocaleChange('hu')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  locale === 'hu'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🇭🇺 Magyar
              </button>
              <button
                onClick={() => handleLocaleChange('en')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  locale === 'en'
                    ? 'bg-[#476a30] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#476a30] text-white rounded-lg hover:bg-[#3d5a28] transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
