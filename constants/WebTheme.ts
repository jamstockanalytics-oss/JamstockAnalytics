// Lightweight Web Theme for Minimal Data Consumption
export const WebTheme = {
  colors: {
    // Light mode optimized colors
    primary: '#2563eb', // Blue - minimal data usage
    secondary: '#64748b', // Slate - neutral
    accent: '#059669', // Green - success
    warning: '#d97706', // Amber - warning
    error: '#dc2626', // Red - error
    
    // Background colors (light mode)
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',
    card: '#ffffff',
    
    // Text colors
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e2e8f0',
    
    // Interactive colors
    hover: '#f1f5f9',
    active: '#e2e8f0',
    disabled: '#cbd5e1',
    
    // Status colors
    success: '#059669',
    info: '#0284c7',
    warning: '#d97706',
    danger: '#dc2626',
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
};

// Optimized CSS classes for minimal bundle size
export const WebStyles = {
  // Layout utilities
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexRow: 'flex flex-row',
  
  // Text utilities
  textXs: 'text-xs text-gray-600',
  textSm: 'text-sm text-gray-600',
  textBase: 'text-base text-gray-900',
  textLg: 'text-lg font-medium text-gray-900',
  textXl: 'text-xl font-semibold text-gray-900',
  text2xl: 'text-2xl font-bold text-gray-900',
  
  // Button utilities
  btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
  btnSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors',
  btnOutline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors',
  
  // Card utilities
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardBody: 'px-6 py-4',
  cardFooter: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  
  // Form utilities
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  
  // Loading states
  loading: 'animate-pulse',
  skeleton: 'bg-gray-200 rounded',
  
  // Responsive utilities
  hidden: 'hidden',
  block: 'block',
  inlineBlock: 'inline-block',
  flex: 'flex',
  inlineFlex: 'inline-flex',
  grid: 'grid',
  inlineGrid: 'inline-grid',
};
