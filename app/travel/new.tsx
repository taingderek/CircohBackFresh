import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';
import { useAppDispatch } from '@/app/core/store/hooks';
import { createTravelPlan } from '@/app/core/store/slices/travelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/app/core/utils/dateUtils';

export default function NewTravelPlanScreen() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // One week from now
  const [notifyContacts, setNotifyContacts] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const [errors, setErrors] = useState({
    title: '',
    destination: '',
    dates: ''
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      destination: '',
      dates: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
      isValid = false;
    }
    
    if (endDate < startDate) {
      newErrors.dates = 'End date must be after start date';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleCreateTravelPlan = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await dispatch(createTravelPlan({
        title,
        destination,
        description: description.trim() || undefined,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        notify_contacts: notifyContacts
      })).unwrap();
      
      router.replace('/travel');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create travel plan. Please try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  };
  
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // Adjust end date if it's before start date
      if (endDate < selectedDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)); // One day after start
      }
    }
  };
  
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Travel Plan',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleCreateTravelPlan}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.label}>Title*</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Enter a title for your trip"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              maxLength={100}
            />
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : null}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Destination*</Text>
            <TextInput
              style={[styles.input, errors.destination ? styles.inputError : null]}
              placeholder="Where are you going?"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={destination}
              onChangeText={setDestination}
              autoCapitalize="sentences"
              maxLength={100}
            />
            {errors.destination ? (
              <Text style={styles.errorText}>{errors.destination}</Text>
            ) : null}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Trip Dates*</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.dateText}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.dateSeperator}>to</Text>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.dateText}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.dates ? (
              <Text style={styles.errorText}>{errors.dates}</Text>
            ) : null}
            
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes or details about your trip"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.switchLabel}>Notify Contacts</Text>
                <Text style={styles.switchDescription}>
                  Let your contacts know about this trip
                </Text>
              </View>
              <Switch
                value={notifyContacts}
                onValueChange={setNotifyContacts}
                trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
                thumbColor={notifyContacts ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
                ios_backgroundColor={COLORS.GRAY_DARK}
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTravelPlan}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.BACKGROUND} />
                <Text style={styles.createButtonText}>Create Travel Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    paddingHorizontal: SPACING.MEDIUM,
  },
  saveButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratSemiBold',
  },
  formSection: {
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  label: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratMedium',
    marginBottom: SPACING.SMALL,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    color: COLORS.TEXT,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.MEDIUM,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.SMALL,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.MEDIUM,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
  },
  dateText: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratRegular',
    marginLeft: SPACING.SMALL,
  },
  dateSeperator: {
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: SPACING.SMALL,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
  },
  switchLabel: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratMedium',
    marginBottom: 4,
  },
  switchDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.SMALL,
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.XLARGE,
  },
  createButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
    fontSize: FONT_SIZES.MEDIUM,
    marginLeft: SPACING.SMALL,
  }
}); 