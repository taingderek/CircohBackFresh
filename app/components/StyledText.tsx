import { Text, TextProps } from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}

export function RegularText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'MontserratRegular' }]} />;
}

export function MediumText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'MontserratMedium' }]} />;
}

export function SemiBoldText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'MontserratSemiBold' }]} />;
}

export function BoldText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'MontserratBold' }]} />;
} 