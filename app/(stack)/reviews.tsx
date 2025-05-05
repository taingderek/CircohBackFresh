import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/app/core/constants/theme';

// Define types for our data
interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

interface FilterOption {
  id: string;
  label: string;
}

// Mock review data - in a real app, this would come from an API
const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Sarah J.',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 5,
    text: 'CircohBack has completely transformed how I keep in touch with important people in my life! The reminders are subtle but effective, and the AI message suggestions save me so much time.',
    date: '2 weeks ago',
    verified: true,
  },
  {
    id: '2',
    name: 'Michael K.',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4,
    text: 'Great app for maintaining professional relationships. I use it daily to make sure I\'m following up with clients and partners at the right frequency. The reminders help me never miss an important touchpoint.',
    date: '1 month ago',
    verified: true,
  },
  {
    id: '3',
    name: 'Emily R.',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    rating: 5,
    text: 'As someone who struggles with keeping in touch, this app is a lifesaver. The UI is beautiful and the premium features are totally worth it!',
    date: '3 months ago',
    verified: true,
  },
  {
    id: '4',
    name: 'David L.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 4,
    text: 'I use this app to maintain my network in the tech industry. The analytics help me see who I\'m losing touch with, and the custom categories really help organize my contacts.',
    date: '2 months ago',
    verified: true,
  },
  {
    id: '5',
    name: 'Jessica P.',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    rating: 5,
    text: 'I\'ve tried many relationship management apps, and CircohBack is by far the best. The AI message generation feature is incredibly natural, and the reminders are perfectly timed.',
    date: '2 weeks ago',
    verified: true,
  },
  {
    id: '6',
    name: 'Robert M.',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    rating: 5,
    text: 'This app encouraged me to reconnect with old friends I had lost touch with. The interface is intuitive and makes relationship management feel less like a chore.',
    date: '1 month ago',
    verified: true,
  }
];

// Filter options for reviews
const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Reviews' },
  { id: '5', label: '5 Stars' },
  { id: '4', label: '4 Stars' },
  { id: '3', label: '3 Stars' },
  { id: '2', label: '2 Stars' },
  { id: '1', label: '1 Star' }
];

export default function ReviewsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Calculate average rating
  const averageRating = REVIEWS.reduce((acc, review) => acc + review.rating, 0) / REVIEWS.length;
  
  // Filter reviews based on selected filter
  const filteredReviews = selectedFilter === 'all'
    ? REVIEWS
    : REVIEWS.filter(review => review.rating === parseInt(selectedFilter));
  
  // Render review item
  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.reviewerName}>{item.name}</Text>
          <View style={styles.reviewDate}>
            <Text style={styles.dateText}>{item.date}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.PRIMARY} />
                <Text style={styles.verifiedText}>Verified User</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < item.rating ? "star" : "star-outline"}
            size={16}
            color={index < item.rating ? COLORS.WARNING : COLORS.GRAY}
            style={styles.starIcon}
          />
        ))}
      </View>
      
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  const handleWriteReview = () => {
    Alert.alert(
      'Write a Review',
      'Thank you for wanting to share your experience! Please rate CircohBack on the App Store or Google Play to help others discover our app.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'OK', onPress: () => console.log('Review prompt acknowledged') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.title}>User Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.ratingOverview}>
        <View style={styles.averageRatingContainer}>
          <Text style={styles.averageRatingValue}>{averageRating.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.round(averageRating) ? "star" : "star-outline"}
                size={20}
                color={index < Math.round(averageRating) ? COLORS.WARNING : COLORS.GRAY}
                style={styles.overviewStarIcon}
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>{REVIEWS.length} reviews</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={handleWriteReview}
        >
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.filterOption,
                selectedFilter === item.id && styles.selectedFilter
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text 
                style={[
                  styles.filterText,
                  selectedFilter === item.id && styles.selectedFilterText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersScrollContent}
        />
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={48} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No reviews found for this filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD,
    marginTop: SPACING.MEDIUM,
    marginHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  averageRatingContainer: {
    alignItems: 'center',
  },
  averageRatingValue: {
    fontSize: FONT_SIZES.XXXL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: SPACING.TINY,
  },
  overviewStarIcon: {
    marginHorizontal: 2,
  },
  totalReviews: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  writeReviewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  writeReviewText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.SMALL,
  },
  filtersContainer: {
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  filtersScrollContent: {
    paddingHorizontal: SPACING.MEDIUM,
  },
  filterOption: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    backgroundColor: COLORS.CARD,
    marginRight: SPACING.SMALL,
  },
  selectedFilter: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterText: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.SMALL,
  },
  selectedFilterText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.MEDIUM,
  },
  reviewCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.SMALL,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  reviewDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginRight: SPACING.SMALL,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.SMALL,
  },
  starIcon: {
    marginRight: 3,
  },
  reviewText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XLARGE,
  },
  emptyText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
  },
}); 