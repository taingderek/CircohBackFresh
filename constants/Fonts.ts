export const Fonts = {
  // Define font constants to use throughout the app
  SpaceMono: 'SpaceMono-Regular',
  MontserratRegular: 'Montserrat-Regular',
  MontserratMedium: 'Montserrat-Medium',
  MontserratSemiBold: 'Montserrat-SemiBold',
  MontserratBold: 'Montserrat-Bold',
};

// Font mapping object for useFonts
export const FontsToLoad = {
  [Fonts.SpaceMono]: require('../assets/fonts/SpaceMono-Regular.ttf'),
  [Fonts.MontserratRegular]: require('../assets/fonts/Montserrat-Regular.ttf'),
  [Fonts.MontserratMedium]: require('../assets/fonts/Montserrat-Medium.ttf'),
  [Fonts.MontserratSemiBold]: require('../assets/fonts/Montserrat-SemiBold.ttf'),
  [Fonts.MontserratBold]: require('../assets/fonts/Montserrat-Bold.ttf'),
}; 