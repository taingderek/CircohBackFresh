# Using NativeWind in CircohBack

This document provides guidance on how to use NativeWind for styling components in the CircohBack project.

## Setup Overview

The project is already configured with NativeWind v4:

- **babel.config.js**: Includes `'nativewind/babel'` plugin
- **tailwind.config.js**: Contains theme customization using our design system colors and styles
- **postcss.config.js**: Sets up the NativeWind PostCSS processor

## Basic Usage

### 1. Importing the `styled` Function

```tsx
import { styled } from 'nativewind';
```

### 2. Creating Styled Components

Wrap React Native components with the `styled` function:

```tsx
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
```

### 3. Using Tailwind Classes

Use the `className` prop to apply Tailwind CSS classes:

```tsx
<StyledView className="flex-1 bg-background p-4">
  <StyledText className="text-lg font-semibold text-text">
    Hello World
  </StyledText>
</StyledView>
```

## CircohBack Color System

Our Tailwind configuration includes the following color palette:

```
primary: {
  dark: '#121212',
  DEFAULT: '#32FFA5', // Mint
  light: '#4CFFB2',
}
secondary: {
  dark: '#1E1E1E',
  DEFAULT: '#BE93FD', // Lavender
  light: '#D0ACFF',
}
tertiary: {
  DEFAULT: '#FF93B9', // Pink
  light: '#FFA9C8',
}
background: {
  DEFAULT: '#121212',
  elevated: '#1E1E1E',
  card: '#252525',
}
text: {
  DEFAULT: '#FFFFFF',
  secondary: '#B0B0B0',
  muted: '#707070',
}
```

## Component Examples

### NativeWindButton

```tsx
import NativeWindButton from '../components/common/NativeWindButton';

// Basic usage
<NativeWindButton 
  title="Click Me" 
  onPress={() => {}} 
/>

// With variants
<NativeWindButton 
  title="Primary Button" 
  variant="primary"
  onPress={() => {}} 
/>

<NativeWindButton 
  title="Secondary Button" 
  variant="secondary" 
  onPress={() => {}} 
/>

<NativeWindButton 
  title="Outline Button" 
  variant="outline"
  onPress={() => {}} 
/>

// With sizes
<NativeWindButton 
  title="Small Button" 
  size="small"
  onPress={() => {}} 
/>

// With icons
<NativeWindButton 
  title="Button with Icon" 
  leftIcon={<Feather name="plus" size={16} color="#121212" />}
  onPress={() => {}} 
/>

// Custom styling
<NativeWindButton 
  title="Custom Button" 
  className="bg-tertiary shadow-glow-pink"
  textClassName="font-bold"
  onPress={() => {}} 
/>
```

### NativeWindCard

```tsx
import NativeWindCard from '../components/common/NativeWindCard';

// Basic card
<NativeWindCard 
  title="Card Title" 
  subtitle="Card subtitle text"
>
  <Text>Card content goes here</Text>
</NativeWindCard>

// Card variants
<NativeWindCard variant="elevated">
  <Text>Elevated card with shadow</Text>
</NativeWindCard>

<NativeWindCard variant="bordered">
  <Text>Card with border</Text>
</NativeWindCard>

// Clickable card
<NativeWindCard 
  title="Clickable Card" 
  onPress={() => console.log('Card pressed')}
>
  <Text>Tap this card</Text>
</NativeWindCard>

// Card with footer
<NativeWindCard 
  title="Card with Footer"
  footer={
    <View className="flex-row justify-end">
      <NativeWindButton 
        title="Action" 
        size="small"
        onPress={() => {}} 
      />
    </View>
  }
>
  <Text>Card content</Text>
</NativeWindCard>
```

## Best Practices

1. **Use Design System Colors**: Always use the color tokens defined in the theme (`primary`, `secondary`, etc.) rather than hardcoded hex values.

2. **Prefer Atomic Classes**: Use granular utility classes (e.g., `mt-4 px-2`) instead of creating custom classes.

3. **Responsive Design**: Use Tailwind's responsive utilities to make components adapt to different screen sizes.

4. **Dark Mode Support**: Our theme is configured for dark mode. Use semantic color tokens like `text` and `background` which will automatically adapt.

5. **Custom Components**: Create reusable styled components that encapsulate common patterns.

6. **Consistent Spacing**: Use the spacing scale defined in our theme (`xs`, `sm`, `md`, `lg`, etc.).

7. **Shadows and Effects**: Leverage custom shadows like `shadow-glow-mint` for visual emphasis.

## Custom Extensions

Our Tailwind configuration includes custom extensions:

- **Shadows**: `shadow-glow-mint`, `shadow-glow-lavender`, `shadow-card`, etc.
- **Font Families**: `font-sans`, `font-medium`, `font-semibold`, `font-bold`
- **Border Radii**: `rounded-xs`, `rounded-sm`, `rounded-md`, etc.
- **Spacing**: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`

## Demo Screen

For a comprehensive example of NativeWind components, see the `NativeWindDemo` screen which showcases different components and styling approaches.

## Migration Guidance

When migrating existing components to NativeWind:

1. Convert StyleSheet styles to equivalent Tailwind classes
2. Wrap React Native components with `styled()`
3. Replace style props with className props
4. Use semantic color names from our theme instead of hex values

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 