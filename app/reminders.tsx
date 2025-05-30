import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import HeaderWithBackButton from '@/app/components/navigation/HeaderWithBackButton';
import Icon from '@/app/components/common/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/core/store';
import { toggleReminderActive, deleteReminder } from '@/app/core/store/slices/reminderSlice';

// Reminder status filter options
type FilterStatus = 'all' | 'active' | 'completed';

export default function RemindersScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for the active filter
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
  // Get reminders from Redux store
  const reminders = useSelector((state: RootState) => state.reminders.items);
  
  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return reminder.active;
    if (filterStatus === 'completed') return !reminder.active;
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Handle adding a new reminder
  const handleAddReminder = () => {
    router.push('/reminder-form');
  };
  
  // Handle editing a reminder
  const handleEditReminder = (reminderId: string) => {
    router.push({
      pathname: '/reminder-form',
      params: { reminderId }
    });
  };
  
  // Handle toggling a reminder active state
  const handleToggleActive = (reminderId: string) => {
    dispatch(toggleReminderActive(reminderId));
  };
  
  // Handle deleting a reminder
  const handleDeleteReminder = (reminderId: string) => {
    dispatch(deleteReminder(reminderId));
  };
  
  // Render a reminder item
  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderHeader}>
        <View style={[
          styles.priorityIndicator, 
          { backgroundColor: getPriorityColor(item.priority) }
        ]} />
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Switch
          value={item.active}
          onValueChange={() => handleToggleActive(item.id)}
          trackColor={{ false: COLORS.GRAY_DARK, true: `${COLORS.PRIMARY}80` }}
          thumbColor={item.active ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
        />
      </View>
      
      <View style={styles.reminderDetails}>
        <View style={styles.reminderDetailItem}>
          <Icon name="person-outline" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.reminderDetailText}>
            {item.contactName}
          </Text>
        </View>
        
        <View style={styles.reminderDetailItem}>
          <Icon name="calendar-outline" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.reminderDetailText}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        {item.recurrence && (
          <View style={styles.reminderDetailItem}>
            <Icon name="repeat-outline" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.reminderDetailText}>
              {formatRecurrence(item.recurrence)}
            </Text>
          </View>
        )}
      </View>
      
      {item.notes && (
        <Text style={styles.reminderNotes}>{item.notes}</Text>
      )}
      
      <View style={styles.reminderActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditReminder(item.id)}
        >
          <Icon name="create-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteReminder(item.id)}
        >
          <Icon name="trash-outline" size={20} color={COLORS.ERROR} />
          <Text style={[styles.actionButtonText, { color: COLORS.ERROR }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Get color based on priority
  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'high': return COLORS.ERROR;
      case 'medium': return COLORS.WARNING;
      case 'low': return COLORS.SUCCESS;
      default: return COLORS.PRIMARY;
    }
  };
  
  // Format recurrence for display
  const formatRecurrence = (recurrence: string): string => {
    switch(recurrence) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Every 3 months';
      case 'biannual': return 'Every 6 months';
      case 'annual': return 'Yearly';
      default: return 'Custom';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <HeaderWithBackButton 
        title="Manage Reminders" 
        onBackPress={() => router.back()}
      />
      
      <View style={styles.content}>
        {/* Filter tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filterStatus === 'all' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text 
              style={[
                styles.filterText, 
                filterStatus === 'all' && styles.activeFilterText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filterStatus === 'active' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text 
              style={[
                styles.filterText, 
                filterStatus === 'active' && styles.activeFilterText
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              filterStatus === 'completed' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text 
              style={[
                styles.filterText, 
                filterStatus === 'completed' && styles.activeFilterText
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Add Reminder Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddReminder}
        >
          <Icon name="add-outline" size={24} color={COLORS.TEXT} />
          <Text style={styles.addButtonText}>Add New Reminder</Text>
        </TouchableOpacity>
        
        {/* Reminders List */}
        {filteredReminders.length > 0 ? (
          <FlatList
            data={filteredReminders}
            renderItem={renderReminderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={48} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyStateTitle}>No reminders found</Text>
            <Text style={styles.emptyStateText}>
              {filterStatus === 'all' 
                ? "You don't have any reminders yet." 
                : filterStatus === 'active' 
                  ? "You don't have any active reminders." 
                  : "You don't have any completed reminders."}
            </Text>
            {filterStatus === 'all' && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleAddReminder}
              >
                <Text style={styles.emptyStateButtonText}>Create Your First Reminder</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.MEDIUM,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  activeFilterText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY + '30',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  addButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.SMALL,
  },
  listContainer: {
    paddingBottom: SPACING.LARGE,
  },
  reminderItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.SMALL,
  },
  reminderTitle: {
    flex: 1,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  reminderDetails: {
    marginBottom: SPACING.SMALL,
  },
  reminderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  reminderDetailText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SMALL,
  },
  reminderNotes: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
    fontStyle: 'italic',
  },
  reminderActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.SMALL,
    marginTop: SPACING.SMALL,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.LARGE,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.TINY,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
  emptyStateButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  emptyStateButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
}); 