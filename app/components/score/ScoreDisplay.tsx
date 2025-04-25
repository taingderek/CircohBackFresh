import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScore } from '../../core/store/slices/scoreSlice';
import { AppDispatch, RootState } from '../../core/store';
import { useIsFocused } from '@react-navigation/native';

type ScoreDisplayProps = {
  size?: 'small' | 'medium' | 'large';
  showBreakdown?: boolean;
};

export default function ScoreDisplay({ 
  size = 'medium', 
  showBreakdown = false 
}: ScoreDisplayProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();
  
  const { score, breakdown, isLoading, error } = useSelector((state: RootState) => state.score);
  const isPremium = useSelector((state: RootState) => state.subscription.isPremium);
  
  // Fetch score when component mounts or screen is focused
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchScore());
    }
  }, [dispatch, isFocused]);
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 800) return '#32FFA5'; // Mint green
    if (score >= 600) return '#93FDFD'; // Cyan
    if (score >= 400) return '#BE93FD'; // Lavender
    if (score >= 200) return '#FF93B9'; // Pink
    return '#FF5555'; // Red for low scores
  };
  
  // Determine size-based styles
  const getScoreSize = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 80, height: 80 },
          score: { fontSize: 24 },
          label: { fontSize: 10 }
        };
      case 'large':
        return {
          container: { width: 180, height: 180 },
          score: { fontSize: 56 },
          label: { fontSize: 16 }
        };
      default: // medium
        return {
          container: { width: 120, height: 120 },
          score: { fontSize: 32 },
          label: { fontSize: 12 }
        };
    }
  };
  
  const sizeStyles = getScoreSize();
  const scoreColor = getScoreColor(score);
  
  if (isLoading && !score) {
    return (
      <View style={[styles.container, sizeStyles.container]}>
        <ActivityIndicator color="#32FFA5" size="large" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, sizeStyles.container]}>
        <Text style={styles.errorText}>Error loading score</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.wrapper}>
      <View 
        style={[
          styles.container, 
          sizeStyles.container, 
          { borderColor: scoreColor }
        ]}
      >
        <Text style={[styles.score, sizeStyles.score, { color: scoreColor }]}>
          {score}
        </Text>
        <Text style={[styles.label, sizeStyles.label]}>
          CircohBack Score
        </Text>
      </View>
      
      {showBreakdown && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Consistency</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${breakdown.consistency}%`, backgroundColor: '#32FFA5' }
                ]} 
              />
            </View>
            <Text style={styles.breakdownValue}>{breakdown.consistency}%</Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Empathy</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${breakdown.empathy}%`, backgroundColor: '#BE93FD' }
                ]} 
              />
            </View>
            <Text style={styles.breakdownValue}>{breakdown.empathy}%</Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Thoughtfulness</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${breakdown.thoughtfulness}%`, backgroundColor: '#FF93B9' }
                ]} 
              />
            </View>
            <Text style={styles.breakdownValue}>{breakdown.thoughtfulness}%</Text>
          </View>
          
          {!isPremium && (
            <View style={styles.premiumContainer}>
              <Text style={styles.premiumText}>
                Upgrade to Premium for detailed analytics and improvement tips
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 10,
  },
  score: {
    fontWeight: 'bold',
    color: '#32FFA5',
  },
  label: {
    color: '#B0B0B0',
    marginTop: 4,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 12,
  },
  breakdownContainer: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    width: 120,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
    marginLeft: 8,
  },
  premiumContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(50, 255, 165, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(50, 255, 165, 0.3)',
  },
  premiumText: {
    color: '#32FFA5',
    fontSize: 14,
    textAlign: 'center',
  }
}); 