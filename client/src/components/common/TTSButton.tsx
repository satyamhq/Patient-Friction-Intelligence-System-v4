import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({
  text,
  className = '',
  size = 'sm',
  label,
}) => {
  const { speakText, stopSpeaking, isSpeaking, textToSpeechEnabled } = useLanguage();
  const { t } = useTranslation();
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);

  if (!textToSpeechEnabled || !window.speechSynthesis) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingLocal) {
      stopSpeaking();
      setIsPlayingLocal(false);
    } else {
      setIsPlayingLocal(true);
      speakText(text);
      // Reset local flag when global isSpeaking completes
      setTimeout(() => setIsPlayingLocal(false), 8000);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
        isPlayingLocal && isSpeaking
          ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-300 animate-pulse'
          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
      } ${className}`}
      title={isPlayingLocal && isSpeaking ? t('common.stop', 'Stop') : t('common.listen', 'Listen')}
    >
      {isPlayingLocal && isSpeaking ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};
