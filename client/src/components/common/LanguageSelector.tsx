import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  showDialect?: boolean;
  fullWidth?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  showDialect = false,
  fullWidth = false,
}) => {
  const {
    currentLanguage,
    currentDialect,
    supportedLanguages,
    changeLanguage,
    changeDialect,
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isDialectOpen, setIsDialectOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsDialectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'} text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border shadow-sm ${
          fullWidth
            ? 'w-full justify-between min-h-[44px] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            : compact
            ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800'
        }`}
        title="Choose Language"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-500 animate-pulse" />
          <span className="font-semibold">{currentLanguage.nativeName}</span>
          <span className="text-xs text-slate-400 font-normal hidden xl:inline">({currentLanguage.name})</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Language Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            fullWidth ? 'left-0 right-0 w-full' : 'right-0 w-64'
          } mt-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2 max-h-80 overflow-y-auto`}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            🌐 Select Language (11 Available)
          </div>
          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ${
                    isSelected
                      ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/40 dark:text-teal-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.nativeName}</span>
                    <span className="text-xs text-slate-400">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              );
            })}
          </div>

          {/* Optional Dialects section */}
          {showDialect && currentLanguage.dialects && currentLanguage.dialects.length > 1 && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
              <div className="text-xs font-semibold text-slate-400 mb-1.5">
                Regional Dialect ({currentLanguage.nativeName}):
              </div>
              <div className="space-y-1">
                {currentLanguage.dialects.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => {
                      changeDialect(d.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 text-xs rounded transition-colors ${
                      currentDialect === d.code
                        ? 'bg-teal-100 text-teal-800 font-medium dark:bg-teal-900/40 dark:text-teal-200'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{d.nativeName}</span>
                    {currentDialect === d.code && <Check className="w-3 h-3 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
