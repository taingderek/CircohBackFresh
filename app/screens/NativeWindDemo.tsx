import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import NativeWindButton from '../components/common/NativeWindButton';
import NativeWindCard from '../components/common/NativeWindCard';
import { Feather } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

const NativeWindDemo = () => {
  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <StyledView className="px-4 py-3 border-b border-border">
        <StyledText className="text-xl font-semibold text-text">NativeWind Demo</StyledText>
        <StyledText className="text-sm text-text-secondary">
          A showcase of styled components using NativeWind
        </StyledText>
      </StyledView>
      
      <StyledScrollView className="flex-1 p-4">
        {/* Section: Cards */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Cards</StyledText>
          
          <StyledView className="space-y-4">
            {/* Default Card */}
            <NativeWindCard 
              title="Default Card" 
              subtitle="This is a simple card with default styling"
            >
              <StyledText className="text-text">
                This is the content of the card. You can put any components here.
              </StyledText>
            </NativeWindCard>
            
            {/* Elevated Card */}
            <NativeWindCard 
              title="Elevated Card" 
              subtitle="This card has a shadow effect"
              variant="elevated"
              footer={
                <StyledView className="flex-row justify-end">
                  <NativeWindButton 
                    title="Action" 
                    onPress={() => console.log('Card action pressed')} 
                    size="small"
                    variant="primary"
                  />
                </StyledView>
              }
            >
              <StyledText className="text-text">
                This card has an elevated appearance with a shadow and includes a footer with actions.
              </StyledText>
            </NativeWindCard>
            
            {/* Bordered Card */}
            <NativeWindCard 
              title="Bordered Card" 
              subtitle="This card has a visible border"
              variant="bordered"
            >
              <StyledText className="text-text">
                This card has a visible border around it for better definition.
              </StyledText>
            </NativeWindCard>
            
            {/* Clickable Card */}
            <NativeWindCard 
              title="Clickable Card" 
              subtitle="This entire card is clickable"
              onPress={() => console.log('Card pressed')}
              variant="elevated"
            >
              <StyledView className="flex-row items-center justify-between">
                <StyledText className="text-text">Tap anywhere on this card</StyledText>
                <Feather name="chevron-right" size={20} color="#B0B0B0" />
              </StyledView>
            </NativeWindCard>
            
            {/* Card with Custom Styling */}
            <NativeWindCard 
              className="bg-primary/10 border-2 border-primary"
              title="Custom Styled Card"
              titleClassName="text-primary font-bold"
            >
              <StyledText className="text-text">
                This card has custom background and border styling.
              </StyledText>
            </NativeWindCard>
          </StyledView>
        </StyledView>
        
        {/* Section: Button Variants */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Button Variants</StyledText>
          
          <StyledView className="space-y-4">
            <NativeWindButton 
              title="Primary Button" 
              onPress={() => console.log('Primary button pressed')} 
              variant="primary"
            />
            
            <NativeWindButton 
              title="Secondary Button" 
              onPress={() => console.log('Secondary button pressed')} 
              variant="secondary"
            />
            
            <NativeWindButton 
              title="Outline Button" 
              onPress={() => console.log('Outline button pressed')} 
              variant="outline"
            />
            
            <NativeWindButton 
              title="Danger Button" 
              onPress={() => console.log('Danger button pressed')} 
              variant="danger"
            />
          </StyledView>
        </StyledView>
        
        {/* Section: Button Sizes */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Button Sizes</StyledText>
          
          <StyledView className="space-y-4">
            <NativeWindButton 
              title="Small Button" 
              onPress={() => console.log('Small button pressed')} 
              size="small"
            />
            
            <NativeWindButton 
              title="Medium Button" 
              onPress={() => console.log('Medium button pressed')} 
              size="medium"
            />
            
            <NativeWindButton 
              title="Large Button" 
              onPress={() => console.log('Large button pressed')} 
              size="large"
            />
          </StyledView>
        </StyledView>
        
        {/* Section: Button States */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Button States</StyledText>
          
          <StyledView className="space-y-4">
            <NativeWindButton 
              title="Disabled Button" 
              onPress={() => console.log('This should not log')} 
              disabled={true}
            />
            
            <NativeWindButton 
              title="Loading Button" 
              onPress={() => console.log('This should not log')} 
              loading={true}
            />
            
            <NativeWindButton 
              title="Full Width Button" 
              onPress={() => console.log('Full width button pressed')} 
              fullWidth={true}
            />
          </StyledView>
        </StyledView>
        
        {/* Section: Buttons with Icons */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Buttons with Icons</StyledText>
          
          <StyledView className="space-y-4">
            <NativeWindButton 
              title="Left Icon" 
              onPress={() => console.log('Left icon button pressed')} 
              leftIcon={<Feather name="plus" size={16} color="#121212" />}
            />
            
            <NativeWindButton 
              title="Right Icon" 
              onPress={() => console.log('Right icon button pressed')} 
              rightIcon={<Feather name="arrow-right" size={16} color="#121212" />}
            />
            
            <NativeWindButton 
              title="Both Icons" 
              onPress={() => console.log('Both icons button pressed')} 
              leftIcon={<Feather name="settings" size={16} color="#121212" />}
              rightIcon={<Feather name="chevron-down" size={16} color="#121212" />}
              variant="secondary"
            />
          </StyledView>
        </StyledView>
        
        {/* Section: Custom Classes */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Custom Styling</StyledText>
          
          <StyledView className="space-y-4">
            <NativeWindButton 
              title="Custom Button" 
              onPress={() => console.log('Custom button pressed')} 
              className="bg-tertiary shadow-glow-pink"
              textClassName="font-bold"
            />
            
            <NativeWindButton 
              title="Elevated Button" 
              onPress={() => console.log('Elevated button pressed')} 
              className="shadow-elevated"
              variant="secondary"
            />
          </StyledView>
        </StyledView>
        
        {/* Card + Button Integration Example */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-medium text-text mb-4">Card with Call to Action</StyledText>
          
          <NativeWindCard variant="elevated">
            <StyledView className="items-center">
              <StyledView className="w-12 h-12 rounded-full bg-secondary items-center justify-center mb-2">
                <Feather name="star" size={24} color="#121212" />
              </StyledView>
              <StyledText className="text-lg font-semibold text-text mb-1">Premium Feature</StyledText>
              <StyledText className="text-text-secondary text-center mb-4">
                Upgrade your plan to access all premium features and get unlimited access.
              </StyledText>
              <NativeWindButton
                title="Upgrade Now"
                onPress={() => console.log('Upgrade pressed')}
                variant="primary"
                size="medium"
                fullWidth={true}
                className="shadow-glow-mint"
              />
            </StyledView>
          </NativeWindCard>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default NativeWindDemo; 