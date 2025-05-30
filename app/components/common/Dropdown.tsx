import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Dimensions,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  style?: object;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
  disabled = false,
  error,
  style,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const containerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const toggleDropdown = () => {
    if (disabled) return;
    
    if (visible) {
      setVisible(false);
    } else {
      containerRef.current?.measure((fx, fy, width, height, px, py) => {
        setDropdownTop(py + height);
        setDropdownLeft(px);
        setDropdownWidth(width);
        setVisible(true);
      });
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onSelect(option.value);
    setVisible(false);
  };

  const handleOutsidePress = () => {
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        ref={containerRef}
        style={[
          styles.button,
          { 
            backgroundColor: theme.colors.card,
            borderColor: error 
              ? theme.colors.error 
              : visible 
                ? theme.colors.primary 
                : theme.colors.border,
          },
          disabled && styles.buttonDisabled
        ]}
        onPress={toggleDropdown}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text 
          style={[
            styles.buttonText, 
            {
              color: selectedOption
                ? theme.colors.text
                : theme.colors.textSecondary,
            }
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather 
          name={visible ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.dropdown, 
                {
                  top: dropdownTop,
                  left: dropdownLeft,
                  width: dropdownWidth,
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  })}],
                }
              ]}
            >
              <ScrollView style={styles.scrollView}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.item,
                      option.value === selectedValue && {
                        backgroundColor: theme.colors.primary + '20',
                      }
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text 
                      style={[
                        styles.itemText, 
                        { color: theme.colors.text },
                        option.value === selectedValue && {
                          color: theme.colors.primary,
                          fontWeight: 'bold',
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === selectedValue && (
                      <Feather 
                        name="check" 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
  },
  scrollView: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Dropdown; 