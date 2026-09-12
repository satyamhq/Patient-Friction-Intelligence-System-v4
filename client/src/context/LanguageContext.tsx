import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, LanguageMeta, isRTL } from '../i18n';
import { api } from '../services/api';

interface LanguageContextType {
  currentLanguage: LanguageMeta;
  currentDialect: string;
  simpleLanguageMode: boolean;
  voiceEnabled: boolean;
  textToSpeechEnabled: boolean;
  isRtlDirection: boolean;
  supportedLanguages: LanguageMeta[];
  changeLanguage: (code: string) => Promise<void>;
  changeDialect: (dialectCode: string) => void;
  toggleSimpleLanguageMode: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setTextToSpeechEnabled: (enabled: boolean) => void;
  speakText: (text: string, overrideLang?: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const [langCode, setLangCode] = useState<string>(() => {
    return localStorage.getItem('pfis_preferred_language') || i18n.language || 'en';
  });

  const [currentDialect, setCurrentDialect] = useState<string>(() => {
    return localStorage.getItem('pfis_preferred_dialect') || 'standard';
  });

  const [simpleLanguageMode, setSimpleLanguageMode] = useState<boolean>(() => {
    return localStorage.getItem('pfis_simple_mode') === 'true';
  });

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem('pfis_voice_enabled');
    return val !== null ? val === 'true' : true;
  });

  const [textToSpeechEnabled, setTextToSpeechEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem('pfis_tts_enabled');
    return val !== null ? val === 'true' : true;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];
  const isRtlDirection = isRTL(langCode);

  useEffect(() => {
    if (i18n.language !== langCode) {
      i18n.changeLanguage(langCode);
    }
  }, [langCode, i18n]);

  const changeLanguage = async (code: string) => {
    const target = LANGUAGES.find((l) => l.code === code);
    if (!target) return;

    setLangCode(code);
    setCurrentDialect('standard');
    localStorage.setItem('pfis_preferred_language', code);
    localStorage.setItem('pfis_preferred_dialect', 'standard');
    await i18n.changeLanguage(code);

    // Persist to backend if logged in
    try {
      if (localStorage.getItem('pfis_auth_token')) {
        await api.post('/languages/preferences', {
          preferredLanguage: code,
          preferredDialect: 'standard',
          simpleLanguageMode,
          voiceEnabled,
          textToSpeechEnabled,
        });
      }
    } catch (e) {
      // Background save error ignored
    }
  };

  const changeDialect = (dialectCode: string) => {
    setCurrentDialect(dialectCode);
    localStorage.setItem('pfis_preferred_dialect', dialectCode);
    try {
      if (localStorage.getItem('pfis_auth_token')) {
        api.post('/languages/preferences', { preferredDialect: dialectCode }).catch(() => {});
      }
    } catch (e) {}
  };

  const toggleSimpleLanguageMode = () => {
    const next = !simpleLanguageMode;
    setSimpleLanguageMode(next);
    localStorage.setItem('pfis_simple_mode', String(next));
    try {
      if (localStorage.getItem('pfis_auth_token')) {
        api.post('/languages/preferences', { simpleLanguageMode: next }).catch(() => {});
      }
    } catch (e) {}
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    localStorage.setItem('pfis_voice_enabled', String(enabled));
  };

  const setTextToSpeechEnabled = (enabled: boolean) => {
    setTextToSpeechEnabledState(enabled);
    localStorage.setItem('pfis_tts_enabled', String(enabled));
  };

  const speakText = (text: string, overrideLang?: string) => {
    if (!textToSpeechEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // cancel any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = overrideLang || currentLanguage.speechCode || 'en-IN';
      utterance.rate = 0.95; // slightly slower for maximum clarity

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentDialect,
        simpleLanguageMode,
        voiceEnabled,
        textToSpeechEnabled,
        isRtlDirection,
        supportedLanguages: LANGUAGES,
        changeLanguage,
        changeDialect,
        toggleSimpleLanguageMode,
        setVoiceEnabled,
        setTextToSpeechEnabled,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
