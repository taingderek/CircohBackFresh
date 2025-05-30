import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import Icon from '@/app/components/common/Icon';
import Avatar from '@/app/components/common/Avatar';
import { reminderService, Reminder } from '@/app/core/services/ReminderService';

export default function CompletedReminderScreen() {
  const router = useRouter();
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts
  useEffect(() => {
    fetchCompletedReminders();
  }, []);

  // Function to fetch completed reminders
  const fetchCompletedReminders = async () => {
    try {
      setError(null);
      setLoading(true);
      const reminders = await reminderService.getCompletedReminders();
      setCompletedReminders(reminders);
    } catch (err) {
      console.error('Failed to fetch completed reminders:', err);
      setError('Unable to load completed reminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCompletedReminders();
  };

  // Filter reminders based on selected type
  const filteredReminders = filterType === 'all' 
    ? completedReminders 
    : completedReminders.filter(reminder => reminder.title.includes(filterType) || reminder.frequency === filterType);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Render individual reminder item
  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.contactInfo}>
          <Avatar 
            size={50} 
            source={null} 
            name={item.contactName} 
          />
          <View style={styles.contactText}>
            <Text style={styles.contactName}>{item.contactName}</Text>
            <Text style={styles.reminderType}>{item.title}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatDate(item.completedDate || item.reminderDate)}</Text>
      </View>
      
      {item.description && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.description}</Text>
        </View>
      )}
    </View>
  );
  
  // Render filter chips
  const renderFilterChip = (type: string, label: string) => (
    <TouchableOpacity 
      style={[
        styles.filterChip,
        filterType === type && styles.activeFilterChip
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text 
        style={[
          styles.filterChipText,
          filterType === type && styles.activeFilterChipText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Extract unique reminder types for filter chips
  const getReminderTypes = () => {
    const types = completedReminders.map(r => {
      if (r.frequency && r.frequency !== 'one-time') {
        return r.frequency;
      }
      return r.title;
    });
    return Array.from(new Set(types)).slice(0, 5); // Get unique types, limit to 5
  };

  // Show loading indicator
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Reminders</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading completed reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error message
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Reminders</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCompletedReminders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Reminders</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedReminders.length}</Text>
          <Text style={styles.statLabel}>Total Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {completedReminders.filter(r => 
              new Date().getTime() - (r.completedDate?.getTime() || 0) < 7 * 24 * 60 * 60 * 1000
            ).length}
          </Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {completedReminders.filter(r => 
              new Date().getTime() - (r.completedDate?.getTime() || 0) < 30 * 24 * 60 * 60 * 1000
            ).length}
          </Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
        >
          {renderFilterChip('all', 'All')}
          {getReminderTypes().map(type => 
            renderFilterChip(type, type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="checkmark-circle-outline" size={60} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No completed reminders yet</Text>
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
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  placeholderView: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.MEDIUM,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.TINY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.TINY,
  },
  statLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  filtersScrollContainer: {
    paddingVertical: SPACING.SMALL,
    paddingRight: SPACING.LARGE,
  },
  filterChip: {
    backgroundColor: COLORS.SECONDARY_DARK,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
    marginRight: SPACING.SMALL,
  },
  filterChipText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
  },
  activeFilterChip: {
    backgroundColor: COLORS.PRIMARY,
  },
  activeFilterChipText: {
    color: COLORS.BACKGROUND,
  },
  listContent: {
    padding: SPACING.MEDIUM,
  },
  reminderCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    marginLeft: SPACING.SMALL,
    flex: 1,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  reminderType: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  dateText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  notesContainer: {
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  notesLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  notesText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XLARGE,
  },
  emptyText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  loadingText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginTop: SPACING.MEDIUM,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.BLACK,
  },
}); 