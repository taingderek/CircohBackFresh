import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#FFFFFF', style }) => {
  return (
    <Ionicons 
      name={name as any} 
      size={size} 
      color={color} 
      style={style}
    />
  );
};

export default Icon; 