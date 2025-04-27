import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          title: 'Terms of Service',
          headerStyle: {
            backgroundColor: COLORS.BACKGROUND,
          },
          headerTintColor: COLORS.TEXT,
        }} 
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.date}>Last Updated: May 15, 2024</Text>
          
          <Text style={styles.paragraph}>
            Please read these Terms of Service ("Terms") carefully before using the CircohBack mobile application 
            (the "Service") operated by CircohBack, Inc. ("us", "we", or "our").
          </Text>
          <Text style={styles.paragraph}>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, 
            you do not have permission to access the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>1. Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so 
            constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions 
            under your password. You agree not to disclose your password to any third party. You must notify us immediately upon 
            becoming aware of any breach of security or unauthorized use of your account.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Subscription and Billing</Text>
          <Text style={styles.paragraph}>
            Some parts of the Service are provided on a subscription basis. You will be billed in advance on a recurring basis, 
            depending on the type of subscription plan you select. We may change subscription fees at any time, but will provide 
            you with advance notice and an opportunity to terminate if we do so.
          </Text>
          <Text style={styles.paragraph}>
            If you wish to cancel your subscription, you may do so through your account settings or by contacting us. You will not 
            receive a refund for the fees you already paid for your current subscription period, and you will continue to have access 
            to the Service through the end of your current subscription period.
          </Text>
          
          <Text style={styles.sectionTitle}>3. Contact Data and Permissions</Text>
          <Text style={styles.paragraph}>
            Our Service may request access to your device's contacts to provide core functionality. You represent and warrant that 
            you have appropriate permissions from the individuals whose data you provide to us through the Service. You shall indemnify 
            and hold harmless CircohBack from any claims arising from your sharing of third-party contact information without proper consent.
          </Text>
          
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree not to use the Service:
          </Text>
          <Text style={styles.bulletText}>• In any way that violates any applicable local, state, national, or international law or regulation.</Text>
          <Text style={styles.bulletText}>• To transmit any material that is defamatory, offensive, or otherwise objectionable.</Text>
          <Text style={styles.bulletText}>• To impersonate or attempt to impersonate CircohBack, a CircohBack employee, another user, or any other person or entity.</Text>
          <Text style={styles.bulletText}>• To engage in any other conduct that restricts or inhibits anyone's use of the Service, or which may harm CircohBack or users of the Service.</Text>
          <Text style={styles.bulletText}>• To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service or any server, computer, or database connected to the Service.</Text>
          <Text style={styles.bulletText}>• To use the Service for commercial purposes not expressly approved by CircohBack.</Text>
          <Text style={styles.bulletText}>• To store or transmit viruses, worms, or other material that is designed to interrupt, destroy, or limit the functionality of any software, hardware, or telecommunications equipment.</Text>
          
          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The Service and its original content, features, and functionality are and will remain the exclusive property of CircohBack 
            and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws. Our trademarks 
            and trade dress may not be used in connection with any product or service without the prior written consent of CircohBack.
          </Text>
          
          <Text style={styles.sectionTitle}>6. User Content</Text>
          <Text style={styles.paragraph}>
            Our Service allows you to store and share information, text, and other material ("User Content"). You are responsible for 
            the User Content that you post, including its legality, reliability, and appropriateness.
          </Text>
          <Text style={styles.paragraph}>
            By posting User Content to the Service, you grant us the right to use, modify, publicly perform, publicly display, reproduce, 
            and distribute such content on and through the Service. You retain any and all of your rights to any User Content you submit, 
            post, or display on or through the Service and you are responsible for protecting those rights.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including 
            without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. If you 
            wish to terminate your account, you may simply discontinue using the Service or contact us.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall CircohBack, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
            incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or 
            other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Disclaimer</Text>
          <Text style={styles.paragraph}>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is 
            provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of 
            merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </Text>
          
          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its 
            conflict of law provisions. Any disputes relating to these Terms will be subject to the exclusive jurisdiction of the courts 
            in San Francisco, California.
          </Text>
          
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will 
            try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined 
            at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound 
            by the revised terms.
          </Text>
          
          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.bulletText}>Email: terms@circohback.com</Text>
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
}); 