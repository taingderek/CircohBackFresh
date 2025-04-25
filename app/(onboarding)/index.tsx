import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();
  
  const onboardingData = [
    {
      title: "Never Lose Touch",
      description: "CircohBack helps you maintain relationships with the people who matter most.",
      image: require('../../assets/images/icon.png'),
    },
    {
      title: "Circle Back Regularly",
      description: "Set reminders to reach out to friends, family, and contacts at the right intervals.",
      image: require('../../assets/images/splash-icon.png'),
    },
    {
      title: "Personalized Connection Plans",
      description: "Manage your relationships based on priority and never let important connections fade away.",
      image: require('../../assets/images/adaptive-icon.png'),
    }
  ];

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      router.replace('/(tabs)/' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/' as any);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/icon.png')}
      style={styles.backgroundImage}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const pageNumber = Math.floor(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentPage(pageNumber);
          }}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={styles.page}>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentPage && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentPage < onboardingData.length - 1 ? (
              <>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
                <Text style={styles.getStartedButtonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  page: {
    width,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontFamily: 'MontserratBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'MontserratRegular',
    color: '#BBBBBB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#3A86FF',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'MontserratMedium',
    color: '#BBBBBB',
  },
  nextButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'MontserratMedium',
    color: '#FFFFFF',
  },
  getStartedButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 16,
    fontFamily: 'MontserratBold',
    color: '#FFFFFF',
  },
}); 