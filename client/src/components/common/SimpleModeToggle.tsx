import React from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface SimpleModeToggleProps {
  className?: string;
}

export const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({ className = '' }) => {
  const { simpleLanguageMode, toggleSimpleLanguageMode } = useLanguage();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleSimpleLanguageMode}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
        simpleLanguageMode
          ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20 ring-2 ring-amber-300 dark:bg-amber-600'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
      } ${className}`}
      title={
        simpleLanguageMode
          ? t('common.simpleLanguageActive', 'Simple Mode Active')
          : t('common.simpleLanguage', 'Simple Language Mode')
      }
    >
      <BookOpen className={`w-3.5 h-3.5 ${simpleLanguageMode ? 'text-amber-100' : 'text-amber-500'}`} />
      <span className="hidden xl:inline">{t('common.simpleLanguage', 'Simple Language Mode')}</span>
      <span className="xl:hidden">Simple Mode</span>
      {simpleLanguageMode && (
        <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-700/60 text-[10px] uppercase tracking-wide">
          ON
        </span>
      )}
    </button>
  );
};
