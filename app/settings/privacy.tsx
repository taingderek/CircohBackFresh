import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          title: 'Privacy Policy',
          headerStyle: {
            backgroundColor: COLORS.BACKGROUND,
          },
          headerTintColor: COLORS.TEXT,
        }} 
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.date}>Last Updated: May 15, 2024</Text>
          
          <Text style={styles.paragraph}>
            This Privacy Policy describes how CircohBack ("we", "our", or "us") collects, uses, and shares your personal information 
            when you use our mobile application (the "App").
          </Text>
          
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            When you use our App, we may collect the following types of information:
          </Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Personal Information:</Text> Name, email address, and profile information you provide during registration.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Contact Information:</Text> With your permission, we access your device's contacts to provide core relationship management functionality.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Usage Data:</Text> Information about how you use the App, including interaction patterns, feature usage, and time spent.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Device Information:</Text> Device type, operating system, unique device identifiers, and mobile network information.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Location Data:</Text> With your permission, approximate location based on IP address or precise location when you use location-based features.</Text>
          
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletText}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletText}>• Process and complete transactions</Text>
          <Text style={styles.bulletText}>• Send you technical notices and support messages</Text>
          <Text style={styles.bulletText}>• Respond to your comments and questions</Text>
          <Text style={styles.bulletText}>• Develop new products and services</Text>
          <Text style={styles.bulletText}>• Generate anonymized, aggregate statistics about how users interact with our App</Text>
          <Text style={styles.bulletText}>• Protect against fraud and abuse</Text>
          <Text style={styles.bulletText}>• Personalize your experience</Text>
          <Text style={styles.bulletText}>• Send you reminder notifications based on your preferences</Text>
          
          <Text style={styles.sectionTitle}>Sharing Your Information</Text>
          <Text style={styles.paragraph}>
            We may share your personal information with:
          </Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Service providers:</Text> Companies that perform services on our behalf, including cloud storage, data analysis, email delivery, and hosting services.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Business partners:</Text> With your consent, we may share information with business partners to offer you certain products, services, or promotions.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Legal requirements:</Text> When required by law, such as to comply with a subpoena or similar legal process, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</Text>
          <Text style={styles.bulletText}>• <Text style={styles.bold}>Business transfers:</Text> In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.</Text>
          
          <Text style={styles.paragraph}>
            We do not sell or rent your personal information to third parties.
          </Text>
          
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized 
            or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or 
            electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>
          
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </Text>
          <Text style={styles.bulletText}>• Right to access the personal information we hold about you</Text>
          <Text style={styles.bulletText}>• Right to rectify inaccurate personal information</Text>
          <Text style={styles.bulletText}>• Right to delete your personal information</Text>
          <Text style={styles.bulletText}>• Right to restrict or object to processing of your personal information</Text>
          <Text style={styles.bulletText}>• Right to data portability</Text>
          <Text style={styles.bulletText}>• Right to withdraw consent at any time</Text>
          
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us at privacy@circohback.com.
          </Text>
          
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our App is not directed to children under 13, and we do not knowingly collect personal information from children 
            under 13. If you become aware that a child has provided us with personal information without parental consent, 
            please contact us, and we will take steps to delete such information.
          </Text>
          
          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
            on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.bulletText}>Email: privacy@circohback.com</Text>
          <Text style={styles.bulletText}>CircohBack, Inc.</Text>
          <Text style={styles.bulletText}>123 Main Street</Text>
          <Text style={styles.bulletText}>San Francisco, CA 94110</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.LARGE,
    paddingBottom: SPACING.XLARGE,
  },
  title: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  date: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY || COLORS.TEXT, // Fallback in case TEXT_SECONDARY isn't defined
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  paragraph: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    paddingLeft: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
}); 