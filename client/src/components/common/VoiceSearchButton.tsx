import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onTranscript,
  className = '',
}) => {
  const { currentLanguage, voiceEnabled } = useLanguage();
  const { t } = useTranslation();

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({
      lang: currentLanguage.speechCode || 'en-IN',
      onResult: (text) => {
        if (text) onTranscript(text);
      },
    });

  if (!voiceEnabled || !isSupported) return null;

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-all ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-300'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      } ${className}`}
      title={isListening ? t('common.listening', 'Listening...') : t('common.speak', 'Speak')}
    >
      {isListening ? (
        <Mic className="w-4 h-4 animate-bounce" />
      ) : (
        <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      )}
    </button>
  );
};
