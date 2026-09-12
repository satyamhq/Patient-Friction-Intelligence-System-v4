import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  cycleTextSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('pfis_text_size') as TextSize) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('pfis_high_contrast') === 'true';
  });

  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return localStorage.getItem('pfis_reduce_motion') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply Text Size Scaling
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${textSize}`);
    localStorage.setItem('pfis_text_size', textSize);

    if (textSize === 'large') {
      root.style.fontSize = '112%';
    } else if (textSize === 'xlarge') {
      root.style.fontSize = '125%';
    } else {
      root.style.fontSize = '100%';
    }
  }, [textSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('pfis_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    localStorage.setItem('pfis_reduce_motion', String(reduceMotion));
  }, [reduceMotion]);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSizeState('large');
    else if (textSize === 'large') setTextSizeState('xlarge');
    else setTextSizeState('normal');
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleReduceMotion = () => {
    setReduceMotion((prev) => !prev);
  };

  const resetAccessibility = () => {
    setTextSizeState('normal');
    setHighContrast(false);
    setReduceMotion(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        cycleTextSize,
        highContrast,
        toggleHighContrast,
        reduceMotion,
        toggleReduceMotion,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
