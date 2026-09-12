import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Eye,
  Type,
  SunMoon,
  Volume2,
  VolumeX,
  Gauge,
  RotateCcw,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const {
    textSize,
    cycleTextSize,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
    resetAccessibility,
  } = useAccessibility();

  const {
    textToSpeechEnabled,
    setTextToSpeechEnabled,
    voiceEnabled,
    setVoiceEnabled,
  } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <aside
      ref={containerRef}
      aria-label="Accessibility options"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[9990] flex flex-col items-start gap-2 max-w-[calc(100vw-2rem)]"
    >
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label="Open Accessibility Toolbar"
        className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-navy-900 text-white dark:bg-teal-600 dark:text-navy-950 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border border-white/20 text-xs tracking-wide min-h-[44px] touch-target"
      >
        <Eye className="w-4 h-4 text-teal-400 dark:text-navy-950 shrink-0" />
        <span className="hidden sm:inline">Accessibility Controls</span>
        <span className="sm:hidden font-bold">Access</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Accessibility Settings Panel */}
      {isOpen && (
        <section
          id="accessibility-panel"
          aria-label="Accessibility controls settings"
          className="w-[calc(100vw-2rem)] max-w-xs sm:w-80 max-h-[72vh] overflow-y-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200 flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accessibility Tools (WCAG 2.1)
            </h3>
            <button
              type="button"
              onClick={resetAccessibility}
              className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Text Size Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-600 dark:text-teal-400" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Text Size</p>
                <p className="text-[10px] text-slate-500 capitalize">{textSize} (100% - 130%)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={cycleTextSize}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-brand-700 dark:text-teal-300 transition-colors"
            >
              {textSize === 'normal' ? 'Normal' : textSize === 'large' ? 'Large (115%)' : 'Extra (130%)'}
            </button>
          </div>

          {/* 2. High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-brand-600 dark:text-teal-400" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">High Contrast</p>
                <p className="text-[10px] text-slate-500">Maximum readability borders</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHighContrast}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? 'bg-teal-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
              }`}
              aria-pressed={highContrast}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                {highContrast && <Check className="w-2.5 h-2.5 text-teal-600" />}
              </div>
            </button>
          </div>



          {/* 4. Voice & Screen Reader Assistance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {textToSpeechEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Voice Assistance</p>
                <p className="text-[10px] text-slate-500">Read aloud important buttons & cards</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTextToSpeechEnabled(!textToSpeechEnabled);
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                textToSpeechEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
              }`}
              aria-pressed={textToSpeechEnabled}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                {textToSpeechEnabled && <Check className="w-2.5 h-2.5 text-emerald-600" />}
              </div>
            </button>
          </div>

          {/* 5. Reduce Animation / Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Reduce Motion</p>
                <p className="text-[10px] text-slate-500">Disable transitions & pulses</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleReduceMotion}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                reduceMotion ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
              }`}
              aria-pressed={reduceMotion}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                {reduceMotion && <Check className="w-2.5 h-2.5 text-indigo-600" />}
              </div>
            </button>
          </div>
        </section>
      )}
    </aside>
  );
};
