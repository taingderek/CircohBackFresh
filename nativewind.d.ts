/// <reference types="nativewind/types" />

declare module 'nativewind' {
  import type { ViewProps } from 'react-native';
  
  export function withExpoSnack(component: React.ComponentType): React.ComponentType;
  
  export interface StyledProps extends ViewProps {
    className?: string;
  }
  
  export function styled<T extends React.ComponentType<any>>(
    Component: T
  ): T & {
    (props: React.ComponentProps<T> & StyledProps): React.ReactElement | null;
  };
} 