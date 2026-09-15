// DesignTokens.ts - Unified Light Mode Design System for Public Health Care Platform

export const DesignTokens = {
  colors: {
    background: {
      app: 'bg-slate-50',
      surface: 'bg-white',
      muted: 'bg-slate-100',
      subtle: 'bg-slate-50/75',
      cardHover: 'hover:bg-slate-50/90',
    },
    border: {
      light: 'border-slate-200',
      subtle: 'border-slate-100',
      strong: 'border-slate-300',
      focus: 'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
    },
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-700',
      muted: 'text-slate-500',
      subtle: 'text-slate-400',
      inverse: 'text-white',
      accent: 'text-teal-700',
    },
    brand: {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white',
      primaryLight: 'bg-teal-50 text-teal-800 border-teal-200',
      secondary: 'bg-sky-600 hover:bg-sky-700 text-white',
      secondaryLight: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    status: {
      success: {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        indicator: 'bg-emerald-500',
      },
      warning: {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-700',
        indicator: 'bg-amber-500',
      },
      danger: {
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-700',
        indicator: 'bg-rose-500',
      },
      info: {
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
        text: 'text-blue-700',
        indicator: 'bg-blue-500',
      },
      neutral: {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        text: 'text-slate-600',
        indicator: 'bg-slate-400',
      },
    },
  },
  typography: {
    h1: 'text-2xl sm:text-3xl font-bold tracking-tight text-slate-900',
    h2: 'text-xl sm:text-2xl font-bold tracking-tight text-slate-900',
    h3: 'text-lg sm:text-xl font-semibold text-slate-900',
    h4: 'text-base font-semibold text-slate-900',
    body: 'text-sm text-slate-700 leading-relaxed',
    bodySmall: 'text-xs text-slate-500 leading-normal',
    caption: 'text-[11px] text-slate-400 font-medium',
    kpiNumber: 'text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900',
  },
  card: {
    base: 'bg-white rounded-2xl border border-slate-200 shadow-xs transition-shadow',
    interactive: 'bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer',
    elevated: 'bg-white rounded-2xl border border-slate-200/90 shadow-md',
    kpi: 'bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between',
  },
  spacing: {
    container: 'max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8',
    sectionGap: 'space-y-6 sm:space-y-8',
    cardPadding: 'p-4 sm:p-6',
  },
  buttons: {
    primary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
    secondary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs active:scale-98 transition-all cursor-pointer',
    subtle: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer',
    emergency: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer',
  },
};
