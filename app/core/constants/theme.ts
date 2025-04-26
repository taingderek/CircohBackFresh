/**
 * Color theme constants used throughout the application
 */
export const COLORS = {
  // Primary colors
  PRIMARY: '#32FFA5', // Mint green glow
  PRIMARY_DARK: '#28cc84',
  PRIMARY_LIGHT: '#6fffbf',
  
  // Secondary colors
  SECONDARY: '#BE93FD', // Lavender
  SECONDARY_DARK: '#9865e1',
  SECONDARY_LIGHT: '#d7b8fe',
  
  // Accent colors
  ACCENT: '#FF93B9', // Pink
  ACCENT_DARK: '#e06997',
  ACCENT_LIGHT: '#ffb1cc',
  
  // Additional accents
  CYAN: '#93FDFD', // Cyan
  
  // Background colors
  BACKGROUND: '#121212', // Dark background
  CARD: '#1E1E1E', // Slightly lighter dark
  
  // Neutrals
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#B0B0B0',
  GRAY: '#707070',
  GRAY_DARK: '#303030',
  
  // Functional colors
  SUCCESS: '#32FFA5',
  WARNING: '#FFA532',
  ERROR: '#FF5A5A',
  INFO: '#BE93FD',
  
  // Text
  TEXT: '#FFFFFF', // Primary text
  TEXT_SECONDARY: '#B0B0B0', // Secondary text
  TEXT_DISABLED: '#707070', // Muted text
  
  // Borders
  BORDER: '#303030'
};

/**
 * Font family constants for the application
 */
export const FONT_FAMILIES = {
  REGULAR: 'Montserrat-Regular',
  MEDIUM: 'Montserrat-Medium',
  SEMIBOLD: 'Montserrat-SemiBold',
  BOLD: 'Montserrat-Bold',
};

/**
 * Font sizes following the blueprint
 */
export const FONT_SIZES = {
  XS: 12,
  SMALL: 14,
  MEDIUM: 16,
  LARGE: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32
};

/**
 * Font weights used throughout the application
 */
export const FONT_WEIGHTS = {
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700'
};

/**
 * Spacing units for consistent margins and paddings (8px grid system)
 */
export const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  XLARGE: 32,
  XXLARGE: 48
};

/**
 * Border radius values for consistent styling
 */
export const BORDER_RADIUS = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  ROUND: 999 // For fully rounded elements
};

/**
 * Shadows and glow effects for elements
 */
export const EFFECTS = {
  SHADOW_SMALL: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  SHADOW_MEDIUM: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  SHADOW_LARGE: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  GLOW_PRIMARY: {
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  GLOW_SECONDARY: {
    shadowColor: COLORS.SECONDARY,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  GLOW_ACCENT: {
    shadowColor: COLORS.ACCENT,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  }
}; 