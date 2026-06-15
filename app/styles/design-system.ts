// Design System - World Cup Theme
export const DESIGN_SYSTEM = {
  // COLORS - World Cup Football Theme
  colors: {
    primary: '#1a4d7f', // Deep football blue
    secondary: '#ffd700', // Golden yellow
    accent: '#ff1a1a', // Vibrant red
    success: '#00cc66', // Green (goal!)
    warning: '#ffaa00', // Orange
    dark: '#0a0e27', // Deep dark
    light: '#f5f5f5', // Off white
    
    // Semantic
    background: '#0a0e27',
    surface: '#151b3d',
    surfaceLight: '#1f2650',
    text: '#ffffff',
    textSecondary: '#b0b8d4',
    border: '#2a3156',
  },

  // TYPOGRAPHY
  typography: {
    // Mobile sizes
    h1Mobile: 'clamp(24px, 6vw, 32px)',
    h2Mobile: 'clamp(20px, 5vw, 28px)',
    h3Mobile: 'clamp(16px, 4vw, 24px)',
    bodyMobile: 'clamp(14px, 3.5vw, 16px)',
    smallMobile: 'clamp(12px, 3vw, 14px)',
    
    // Desktop sizes
    h1: '40px',
    h2: '32px',
    h3: '24px',
    body: '16px',
    small: '14px',
    
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Fira Code", monospace',
    },
    
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // SPACING - Mobile first
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  // BREAKPOINTS
  breakpoints: {
    mobile: '320px',    // iPhone SE, small phones
    mobileLand: '568px', // iPhone landscape
    tablet: '768px',    // iPad
    desktop: '1024px',  // Desktop
    wide: '1440px',     // Wide desktop
    ultrawide: '1920px', // 4K
  },

  // SHADOWS
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
    md: '0 4px 12px rgba(0, 0, 0, 0.3)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(255, 215, 0, 0.3)',
    glowRed: '0 0 20px rgba(255, 26, 26, 0.3)',
  },

  // BORDER RADIUS
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Z-INDEX
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    toast: 1060,
    tooltip: 1070,
  },

  // TRANSITIONS
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// Responsive Utilities
export const RESPONSIVE = {
  // Media queries as functions
  mobile: `@media (max-width: ${DESIGN_SYSTEM.breakpoints.tablet})`,
  tablet: `@media (min-width: ${DESIGN_SYSTEM.breakpoints.tablet}) and (max-width: ${DESIGN_SYSTEM.breakpoints.desktop})`,
  desktop: `@media (min-width: ${DESIGN_SYSTEM.breakpoints.desktop})`,
  wide: `@media (min-width: ${DESIGN_SYSTEM.breakpoints.wide})`,
}