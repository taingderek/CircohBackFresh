// Color system for CircohBack
// These colors follow the design system specified in the .cursorrules file

// Main colors
const primaryDark = '#121212'; // main background
const secondaryDark = '#1E1E1E'; // cards, elements
const accentMint = '#32FFA5'; // primary accent
const accentLavender = '#BE93FD'; // secondary accent
const accentPink = '#FF93B9'; // tertiary accent

// Text colors
const textPrimary = '#FFFFFF';
const textSecondary = '#B0B0B0';
const textMuted = '#707070';

export default {
  primaryDark,
  secondaryDark,
  accentMint,
  accentLavender,
  accentPink,
  textPrimary,
  textSecondary,
  textMuted,
  
  // Keep existing theme support for compatibility
  light: {
    text: '#000',
    background: '#fff',
    tint: accentMint,
    tabIconDefault: '#ccc',
    tabIconSelected: accentMint,
  },
  dark: {
    text: textPrimary,
    background: primaryDark,
    tint: accentMint,
    tabIconDefault: textSecondary,
    tabIconSelected: accentMint,
  },
};
