import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Mic,
  Volume2,
  Save,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const PatientSettings: React.FC = () => {
  const {
    currentLanguage,
    currentDialect,
    simpleLanguageMode,
    voiceEnabled,
    textToSpeechEnabled,
    supportedLanguages,
    changeLanguage,
    changeDialect,
    toggleSimpleLanguageMode,
    setVoiceEnabled,
    setTextToSpeechEnabled,
    speakText,
  } = useLanguage();

  const { t } = useTranslation();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const sampleComplex = t(
    'patient.accessibilityRiskDesc',
    'Estimated operational barrier risk during healthcare completion.'
  );
  const sampleSimple = t(
    'simple.accessibilityHigh',
    'Getting to the hospital and completing treatment may be difficult for you.'
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Globe className="w-3.5 h-3.5" />
            <span>{t('settings.languageSection', 'Language & Accessibility')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t('settings.title', 'Language & Accessibility Preferences')}
          </h1>
          <p className="text-teal-100 text-sm mt-1 max-w-xl">
            {t(
              'settings.subtitle',
              'Customize your native language, regional dialect, and assistive speech tools'
            )}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold">
            {t('settings.savedSuccess', 'Preferences saved successfully!')}
          </span>
        </div>
      )}

      {/* Section 1: Language Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('settings.languageSection', '1. Language & Regional Dialect')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your primary language for all navigation, buttons, and reports
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            {t('settings.preferredLanguage', 'Preferred Language')} (11 Supported)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {supportedLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-bold shadow-sm ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">{lang.nativeName}</span>
                  <span className="text-xs text-slate-400 font-normal">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dialect selector */}
        {currentLanguage.dialects && currentLanguage.dialects.length > 1 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              {t('settings.preferredDialect', 'Preferred Dialect (Optional)')}: {currentLanguage.nativeName}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentLanguage.dialects.map((d) => {
                const isSelected = currentDialect === d.code;
                return (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => changeDialect(d.code)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{d.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Voice & Audio Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('settings.speechSection', '2. Voice Input & Text-to-Speech (TTS)')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'settings.speechDesc',
                'Use voice search and listen to important accessibility cards read aloud.'
              )}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-teal-600" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('settings.enableVoice', 'Enable Microphone Voice Input')}
                </div>
                <div className="text-xs text-slate-500">Speak queries in {currentLanguage.nativeName}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('settings.enableTTS', 'Enable Text-to-Speech (🔊 Audio Read-Aloud)')}
                </div>
                <div className="text-xs text-slate-500">Listen to cards in {currentLanguage.nativeName}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={textToSpeechEnabled}
              onChange={(e) => setTextToSpeechEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Speech button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => speakText(sampleSimple)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-xs font-semibold hover:bg-teal-200 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Audio Read-Aloud (🔊 आवाज़ का परीक्षण करें)</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="flex items-center gap-2 px-6 py-3">
          <Save className="w-4 h-4" />
          <span>{t('settings.savePreferences', 'Save Language & Accessibility Settings')}</span>
        </Button>
      </div>
    </div>
  );
};
