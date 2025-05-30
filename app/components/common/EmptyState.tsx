import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';
import { Feather } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof Feather.glyphMap | null;
  image?: ImageSourcePropType | null;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'inbox',
  image = null,
  actionLabel,
  onAction,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : icon ? (
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.border }]}>
          <Feather name={icon} size={32} color={theme.colors.textSecondary} />
        </View>
      ) : null}

      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      
      {description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button 
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default EmptyState; 