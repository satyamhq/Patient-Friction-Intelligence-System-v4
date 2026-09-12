import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export const FirstVisitLanguageModal: React.FC = () => {
  const { supportedLanguages, currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState(currentLanguage.code);

  useEffect(() => {
    const hasChosen = localStorage.getItem('pfis_has_selected_lang');
    if (!hasChosen) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleConfirm = () => {
    changeLanguage(selectedLang);
    localStorage.setItem('pfis_has_selected_lang', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 mb-3 shadow-inner">
            <Globe className="w-8 h-8 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('modals.chooseLanguage', 'Choose Your Preferred Language')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              'modals.chooseLanguageSubtitle',
              'Select the language you want to use across the PFIS healthcare platform'
            )}
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 mb-6">
          {supportedLanguages.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/70 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200 shadow-sm ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base font-bold">{lang.nativeName}</span>
                  {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 shadow-lg shadow-teal-600/25 transition-all"
          >
            <span>{t('modals.continue', 'Continue to Website')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
