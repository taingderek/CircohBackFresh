import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Pressable,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { formatDate } from '@/app/core/utils/dateUtils';
import { router } from 'expo-router';
import { TravelPlan } from '@/app/core/types/contact';
import { fetchTravelPlans } from '@/app/core/store/slices/travelSlice';

export default function TravelScreen() {
  const dispatch = useAppDispatch();
  const { travelPlans, isLoading, error } = useAppSelector((state) => state.travel);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    dispatch(fetchTravelPlans());
  }, [dispatch]);
  
  // Filter travel plans based on search query and status
  const filteredTravelPlans = travelPlans.filter(plan => {
    const matchesSearch = 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const today = new Date();
    let matchesStatus = true;
    
    if (filterStatus === 'upcoming') {
      matchesStatus = new Date(plan.start_date) > today;
    } else if (filterStatus === 'active') {
      matchesStatus = new Date(plan.start_date) <= today && new Date(plan.end_date) >= today;
    } else if (filterStatus === 'past') {
      matchesStatus = new Date(plan.end_date) < today;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  const renderStatusButton = (status: string, label: string, icon: string) => (
    <TouchableOpacity 
      style={[
        styles.statusButton, 
        filterStatus === status && styles.activeStatusButton
      ]}
      onPress={() => setFilterStatus(status)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={filterStatus === status ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY} 
      />
      <Text 
        style={[
          styles.statusButtonText,
          filterStatus === status && styles.activeStatusText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderTravelPlan = ({ item }: { item: TravelPlan }) => {
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    const isActive = startDate <= new Date() && endDate >= new Date();
    const isPast = endDate < new Date();
    
    return (
      <Pressable 
        style={styles.travelCard}
        onPress={() => router.push({
          pathname: "/travel/[id]",
          params: { id: item.id }
        })}
      >
        <View style={styles.travelIcon}>
          <Ionicons 
            name="airplane" 
            size={24} 
            color={isPast ? COLORS.TEXT_SECONDARY : (isActive ? COLORS.PRIMARY : COLORS.ACCENT)}
          />
        </View>
        <View style={styles.travelDetails}>
          <Text style={styles.travelTitle}>{item.title}</Text>
          <Text style={styles.travelDestination}>
            <Ionicons name="location" size={14} color={COLORS.TEXT_SECONDARY} /> {item.destination}
          </Text>
          <Text style={styles.travelDates}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
      </Pressable>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Travel Plans</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/travel/new")}
        >
          <Ionicons name="add" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.categories}>
        {renderStatusButton('all', 'All', 'earth-outline')}
        {renderStatusButton('upcoming', 'Upcoming', 'calendar-outline')}
        {renderStatusButton('active', 'Active', 'paper-plane-outline')}
        {renderStatusButton('past', 'Past', 'time-outline')}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading travel plans...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorText}>Failed to load travel plans</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchTravelPlans())}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTravelPlans}
          renderItem={renderTravelPlan}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.travelsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane-outline" size={48} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'No matching travel plans found' 
                  : 'No travel plans yet. Create your first trip!'}
              </Text>
              {!searchQuery && filterStatus === 'all' && (
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => router.push("/travel/new")}
                >
                  <Text style={styles.createButtonText}>Create New Trip</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: 'MontserratBold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    height: 50,
  },
  searchIcon: {
    marginRight: SPACING.SMALL,
  },
  searchInput: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratRegular',
  },
  categories: {
    flexDirection: 'row',
    marginBottom: SPACING.MEDIUM,
    flexWrap: 'wrap',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
    marginRight: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  activeStatusButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  statusButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
    fontFamily: 'MontserratMedium',
  },
  activeStatusText: {
    color: COLORS.BACKGROUND,
  },
  travelsList: {
    paddingBottom: SPACING.XXLARGE,
  },
  travelCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    alignItems: 'center',
  },
  travelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  travelDetails: {
    flex: 1,
  },
  travelTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    fontFamily: 'MontserratSemiBold',
    marginBottom: 2,
  },
  travelDestination: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    marginBottom: 2,
  },
  travelDates: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
  },
  retryText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.XXLARGE,
  },
  emptyText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  createButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 20,
  },
  createButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
  },
}); 