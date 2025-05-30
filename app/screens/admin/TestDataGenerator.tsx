import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../core/services/supabaseClient';
import Colors from '@/constants/Colors';
import Toast from 'react-native-toast-message';

// Types for test user creation
type TestUserFormData = {
  email: string;
  password: string;
  fullName: string;
  avatarUrl: string;
  subscriptionTier: 'free' | 'premium';
};

// Types for test data generation options
type TestDataOptions = {
  contactCount: number;
  includeReminders: boolean;
  includeStreaks: boolean;
  includeTravelPlans: boolean;
};

const DEFAULT_FORM_DATA: TestUserFormData = {
  email: '',
  password: 'Password123!',
  fullName: '',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  subscriptionTier: 'free'
};

const DEFAULT_DATA_OPTIONS: TestDataOptions = {
  contactCount: 5,
  includeReminders: true,
  includeStreaks: true,
  includeTravelPlans: true
};

const TestDataGenerator = () => {
  // State for form data and options
  const [formData, setFormData] = useState<TestUserFormData>(DEFAULT_FORM_DATA);
  const [dataOptions, setDataOptions] = useState<TestDataOptions>(DEFAULT_DATA_OPTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Handle form input changes
  const handleInputChange = (key: keyof TestUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle data options changes
  const handleOptionChange = (key: keyof TestDataOptions, value: any) => {
    setDataOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // Create a test user
  const createTestUser = async () => {
    if (!formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Email and password are required',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create_test_user', {
        body: {
          email: formData.email,
          password: formData.password,
          userProfile: {
            full_name: formData.fullName || formData.email.split('@')[0],
            avatar_url: formData.avatarUrl,
            subscription_tier: formData.subscriptionTier,
            bio: 'Test user created for app testing'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      setUserId(data.user.id);
      setResults(data);
      
      Toast.show({
        type: 'success',
        text1: 'Test user created successfully',
        text2: `User ID: ${data.user.id}`
      });
    } catch (error: any) {
      console.error('Error creating test user:', error);
      Toast.show({
        type: 'error',
        text1: 'Error creating test user',
        text2: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate test data for a user
  const generateTestData = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'No user selected',
        text2: 'Create a test user first'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate_test_data', {
        body: {
          userId,
          options: dataOptions
        }
      });
      
      if (error) {
        throw error;
      }
      
      setResults(data);
      
      Toast.show({
        type: 'success',
        text1: 'Test data generated successfully',
        text2: `Created ${data.data.contacts.length} contacts, ${data.data.reminders.length} reminders`
      });
    } catch (error: any) {
      console.error('Error generating test data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error generating test data',
        text2: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form and results
  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setDataOptions(DEFAULT_DATA_OPTIONS);
    setResults(null);
    setUserId(null);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Test Data Generator',
          headerStyle: {
            backgroundColor: Colors.secondaryDark,
          },
          headerTintColor: Colors.textPrimary,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Test User</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="test@example.com"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Optional"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={formData.avatarUrl}
              onChangeText={(value) => handleInputChange('avatarUrl', value)}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subscription Tier</Text>
            <View style={styles.row}>
              <Text style={styles.optionText}>Free</Text>
              <Switch
                trackColor={{ false: Colors.textMuted, true: Colors.accentMint }}
                thumbColor={formData.subscriptionTier === 'premium' ? Colors.accentLavender : Colors.textPrimary}
                onValueChange={(value) => handleInputChange('subscriptionTier', value ? 'premium' : 'free')}
                value={formData.subscriptionTier === 'premium'}
              />
              <Text style={styles.optionText}>Premium</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={createTestUser}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.primaryDark} />
            ) : (
              <Text style={styles.buttonText}>Create Test User</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate Test Data</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Count</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleOptionChange('contactCount', Math.max(1, dataOptions.contactCount - 1))}
              >
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterText}>{dataOptions.contactCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleOptionChange('contactCount', dataOptions.contactCount + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Include Reminders</Text>
            <Switch
              trackColor={{ false: Colors.textMuted, true: Colors.accentMint }}
              thumbColor={dataOptions.includeReminders ? Colors.accentLavender : Colors.textPrimary}
              onValueChange={(value) => handleOptionChange('includeReminders', value)}
              value={dataOptions.includeReminders}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Include Streaks</Text>
            <Switch
              trackColor={{ false: Colors.textMuted, true: Colors.accentMint }}
              thumbColor={dataOptions.includeStreaks ? Colors.accentLavender : Colors.textPrimary}
              onValueChange={(value) => handleOptionChange('includeStreaks', value)}
              value={dataOptions.includeStreaks}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Include Travel Plans</Text>
            <Switch
              trackColor={{ false: Colors.textMuted, true: Colors.accentMint }}
              thumbColor={dataOptions.includeTravelPlans ? Colors.accentLavender : Colors.textPrimary}
              onValueChange={(value) => handleOptionChange('includeTravelPlans', value)}
              value={dataOptions.includeTravelPlans}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, !userId ? styles.buttonDisabled : null]} 
            onPress={generateTestData}
            disabled={!userId || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.primaryDark} />
            ) : (
              <Text style={styles.buttonText}>Generate Test Data</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {results && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            <Text style={styles.resultsText}>
              {JSON.stringify(results, null, 2)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetForm}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: Colors.secondaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.accentMint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resetButton: {
    backgroundColor: Colors.accentPink,
    marginTop: 0,
    marginBottom: 24,
  },
  resetButtonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterButton: {
    backgroundColor: Colors.primaryDark,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterText: {
    color: Colors.textPrimary,
    fontSize: 18,
    marginHorizontal: 16,
  },
  resultsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default TestDataGenerator; 