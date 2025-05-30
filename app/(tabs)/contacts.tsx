import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Pressable,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';
import { Stack, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchContacts, 
  selectFilteredContacts, 
  selectContactsLoading, 
  selectContactsError,
  setSearchTerm,
  setCategoryFilter 
} from '@/app/core/store/slices/contactsSlice';
import { Contact } from '@/app/core/types/contact';

// Sample contact categories
const CONTACT_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'people-outline' },
  { id: 'friend', label: 'Friends', icon: 'heart-outline' },
  { id: 'family', label: 'Family', icon: 'home-outline' },
  { id: 'colleague', label: 'Colleagues', icon: 'briefcase-outline' },
  { id: 'acquaintance', label: 'Acquaintances', icon: 'person-outline' },
  { id: 'business', label: 'Business', icon: 'briefcase-outline' },
  { id: 'vip', label: 'VIPs', icon: 'star-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' }
];

// Sort options
type SortOption = 'name' | 'lastContacted' | 'dueContact' | 'recent';

// View mode
type ViewMode = 'list' | 'grid';

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All Contacts' },
  { id: 'recent', label: 'Recently Contacted' },
  { id: 'due', label: 'Due for Contact' },
  { id: 'favorite', label: 'Favorites' }
];

// Enhanced sample data with additional properties
const SAMPLE_CONTACTS = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    category: 'friend', 
    lastContacted: '2023-11-15', 
    dueDate: '2023-12-15', 
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@example.com',
    avatar: null,
    isFavorite: true
  },
  { 
    id: '2', 
    name: 'Michael Brown', 
    category: 'family', 
    lastContacted: '2023-12-01', 
    dueDate: '2023-12-10', 
    phone: '+1 (555) 234-5678',
    email: 'mike.brown@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '3', 
    name: 'Emma Wilson', 
    category: 'colleague', 
    lastContacted: '2023-10-25', 
    dueDate: '2023-12-25', 
    phone: '+1 (555) 345-6789',
    email: 'emma.w@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '4', 
    name: 'James Thompson', 
    category: 'friend', 
    lastContacted: '2023-11-28', 
    dueDate: '2023-12-28', 
    phone: '+1 (555) 456-7890',
    email: 'james.t@example.com',
    avatar: null,
    isFavorite: true
  },
  { 
    id: '5', 
    name: 'Lisa Anderson', 
    category: 'family', 
    lastContacted: '2023-12-04', 
    dueDate: '2023-12-08', 
    phone: '+1 (555) 567-8901',
    email: 'lisa.a@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '6', 
    name: 'David Martin', 
    category: 'colleague', 
    lastContacted: '2023-11-10', 
    dueDate: '2023-12-10', 
    phone: '+1 (555) 678-9012',
    email: 'david.m@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '7', 
    name: 'Jennifer Garcia', 
    category: 'friend', 
    lastContacted: '2023-12-02', 
    dueDate: '2023-12-16', 
    phone: '+1 (555) 789-0123',
    email: 'jennifer.g@example.com',
    avatar: null,
    isFavorite: true
  },
  { 
    id: '8', 
    name: 'Robert Miller', 
    category: 'family', 
    lastContacted: '2023-11-29', 
    dueDate: '2023-12-13', 
    phone: '+1 (555) 890-1234',
    email: 'robert.m@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '9', 
    name: 'Elizabeth Davis', 
    category: 'colleague', 
    lastContacted: '2023-10-15', 
    dueDate: '2023-12-15', 
    phone: '+1 (555) 901-2345',
    email: 'elizabeth.d@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '10', 
    name: 'William Rodriguez', 
    category: 'friend', 
    lastContacted: '2023-12-03', 
    dueDate: '2023-12-17', 
    phone: '+1 (555) 012-3456',
    email: 'william.r@example.com',
    avatar: null,
    isFavorite: true
  },
  { 
    id: '11', 
    name: 'Patricia Johnson', 
    category: 'acquaintance', 
    lastContacted: '2023-11-05', 
    dueDate: '2023-12-20', 
    phone: '+1 (555) 123-4567',
    email: 'patricia.j@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '12', 
    name: 'Thomas Lee', 
    category: 'business', 
    lastContacted: '2023-09-22', 
    dueDate: '2023-12-22', 
    phone: '+1 (555) 234-5678',
    email: 'thomas.l@example.com',
    avatar: null,
    isFavorite: false
  },
  { 
    id: '13', 
    name: 'Richard Branson', 
    category: 'vip', 
    lastContacted: '2023-11-30', 
    dueDate: '2023-12-15', 
    phone: '+1 (555) 345-6789',
    email: 'richard.b@example.com',
    avatar: null,
    isFavorite: true
  }
];

export default function ContactsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get contacts data from Redux
  const filteredContacts = useSelector(selectFilteredContacts);
  const isLoading = useSelector(selectContactsLoading);
  const error = useSelector(selectContactsError);
  
  // Local state variables
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [filterOption, setFilterOption] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Fetch contacts on component mount
  useEffect(() => {
    dispatch(fetchContacts() as any);
  }, [dispatch]);
  
  // Update search term in Redux when local state changes
  useEffect(() => {
    dispatch(setSearchTerm(searchQuery));
  }, [searchQuery, dispatch]);
  
  // Update category filter in Redux when local state changes
  useEffect(() => {
    dispatch(setCategoryFilter(filterCategory as any));
  }, [filterCategory, dispatch]);
  
  // Parse dates for comparison
  const parseDate = (dateString: string) => {
    return new Date(dateString);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };
  
  // Handle contact press
  const handleContactPress = (contactId: string) => {
    router.push(`/contact/${contactId}`);
  };
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = CONTACT_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || 'person-outline';
  };
  
  // Get category label
  const getCategoryLabel = (categoryId: string) => {
    const category = CONTACT_CATEGORIES.find(c => c.id === categoryId);
    return category?.label || 'Other';
  };
  
  // Render category filter button
  const renderCategoryButton = (category: typeof CONTACT_CATEGORIES[0]) => (
    <TouchableOpacity 
      key={category.id}
      style={[
        styles.categoryButton, 
        filterCategory === category.id && styles.activeCategoryButton
      ]}
      onPress={() => setFilterCategory(category.id)}
    >
      <Ionicons 
        name={category.icon as any} 
        size={16} 
        color={filterCategory === category.id ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY} 
      />
      <Text 
        style={[
          styles.categoryButtonText,
          filterCategory === category.id && styles.activeCategoryText
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );
  
  // Render a contact in list view
  const renderContactListItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => handleContactPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactInitials}>{getInitials(item.contactName)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName}>{item.contactName}</Text>
          {item.relationship && (
            <View style={styles.categoryTagSmall}>
              <Ionicons name={getCategoryIcon(item.relationship) as any} size={12} color={COLORS.PRIMARY} />
            </View>
          )}
        </View>
        
        <View style={styles.contactDetails}>
          {item.contactEmail && (
            <Text style={styles.contactDetail}>
              <Ionicons name="mail-outline" size={12} color={COLORS.TEXT_SECONDARY} /> {item.contactEmail}
            </Text>
          )}
          {item.lastContactDate && (
            <Text style={styles.contactDate}>
              Last contacted: {formatDate(item.lastContactDate)}
            </Text>
          )}
        </View>
      </View>
      
      {item.nextContactDate && (
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDate}>
            {new Date(item.nextContactDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.dueLabel}>Due</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Render a contact in grid view
  const renderContactGridItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => handleContactPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.gridAvatar}>
        <Text style={styles.gridInitials}>{getInitials(item.contactName)}</Text>
        {item.relationship && (
          <View style={styles.gridCategoryBadge}>
            <Ionicons name={getCategoryIcon(item.relationship) as any} size={12} color={COLORS.BACKGROUND} />
          </View>
        )}
      </View>
      <Text style={styles.gridName} numberOfLines={1}>{item.contactName}</Text>
      
      {item.nextContactDate && (
        <View style={styles.gridDueDateContainer}>
          <Text style={styles.gridDueDate}>
            Due: {new Date(item.nextContactDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            })}
          </Text>
        </View>
      )}
      
      {!item.nextContactDate && item.lastContactDate && (
        <Text style={styles.gridLastContacted}>
          {formatDate(item.lastContactDate)}
        </Text>
      )}
    </TouchableOpacity>
  );
  
  // Render the filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Contacts</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {FILTER_OPTIONS.map(option => (
              <TouchableOpacity 
                key={option.id}
                style={[
                  styles.modalOption,
                  filterOption === option.id && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setFilterOption(option.id);
                  setShowFilterModal(false);
                }}
              >
                <Text 
                  style={[
                    styles.modalOptionText,
                    filterOption === option.id && styles.modalOptionTextSelected
                  ]}
                >
                  {option.label}
                </Text>
                {filterOption === option.id && (
                  <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  // Render the sort modal
  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort Contacts</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity 
              style={[
                styles.modalOption,
                sortOption === 'name' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSortOption('name');
                setShowSortModal(false);
              }}
            >
              <Text 
                style={[
                  styles.modalOptionText,
                  sortOption === 'name' && styles.modalOptionTextSelected
                ]}
              >
                Alphabetical (A-Z)
              </Text>
              {sortOption === 'name' && (
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalOption,
                sortOption === 'lastContacted' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSortOption('lastContacted');
                setShowSortModal(false);
              }}
            >
              <Text 
                style={[
                  styles.modalOptionText,
                  sortOption === 'lastContacted' && styles.modalOptionTextSelected
                ]}
              >
                Last Contacted
              </Text>
              {sortOption === 'lastContacted' && (
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalOption,
                sortOption === 'dueContact' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSortOption('dueContact');
                setShowSortModal(false);
              }}
            >
              <Text 
                style={[
                  styles.modalOptionText,
                  sortOption === 'dueContact' && styles.modalOptionTextSelected
                ]}
              >
                Due for Contact
              </Text>
              {sortOption === 'dueContact' && (
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalOption,
                sortOption === 'recent' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSortOption('recent');
                setShowSortModal(false);
              }}
            >
              <Text 
                style={[
                  styles.modalOptionText,
                  sortOption === 'recent' && styles.modalOptionTextSelected
                ]}
              >
                Recently Added
              </Text>
              {sortOption === 'recent' && (
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  // Navigate to add contact screen
  const handleAddContact = () => {
    router.push('/contact-add');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'My Contacts',
          headerShown: true,
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: 'center'
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Filter and View Controls */}
      <View style={styles.controlsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesContainer}
        >
          {CONTACT_CATEGORIES.map(category => renderCategoryButton(category))}
        </ScrollView>
        
        <View style={styles.viewControls}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color={COLORS.TEXT} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.TEXT} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Ionicons 
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
              size={20} 
              color={COLORS.TEXT} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loaderText}>Loading contacts...</Text>
        </View>
      )}
      
      {/* Error Message */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchContacts() as any)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Contact List or Grid */}
      {!isLoading && !error && (
        <>
          <FlatList
            contentContainerStyle={[
              styles.contactsContainer,
              viewMode === 'grid' && styles.gridContainer,
              filteredContacts.length === 0 && styles.emptyListContainer
            ]}
            data={filteredContacts}
            keyExtractor={item => item.id}
            renderItem={viewMode === 'list' ? renderContactListItem : renderContactGridItem}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode === 'grid' ? 'grid' : 'list'}
            columnWrapperStyle={viewMode === 'grid' ? styles.gridColumnWrapper : undefined}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people" size={48} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyTitle}>No contacts found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your filters or add a new contact</Text>
              </View>
            }
          />
          
          {/* Status Counter - shows when there are contacts */}
          {filteredContacts.length > 0 && (
            <View style={styles.statusCounter}>
              <Text style={styles.statusText}>
                {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Add Contact Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddContact}
      >
        <Ionicons name="add" size={30} color={COLORS.BACKGROUND} />
      </TouchableOpacity>
      
      {/* Filter Modal */}
      {renderFilterModal()}
      
      {/* Sort Modal */}
      {renderSortModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    height: 44,
  },
  searchIcon: {
    marginRight: SPACING.SMALL,
  },
  searchInput: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  categoriesContainer: {
    flex: 1,
    paddingRight: SPACING.MEDIUM,
  },
  viewControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.TINY,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUND,
    marginRight: SPACING.SMALL,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.TINY,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  activeCategoryText: {
    color: COLORS.BACKGROUND,
  },
  contactsContainer: {
    flexGrow: 1,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: SPACING.XLARGE * 3, // Extra space for FAB
  },
  gridContainer: {
    paddingHorizontal: SPACING.MEDIUM,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyTitle: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginHorizontal: SPACING.LARGE,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    marginHorizontal: SPACING.MEDIUM,
    ...EFFECTS.SHADOW_SMALL,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  contactInitials: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.BACKGROUND,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  categoryTagSmall: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: `${COLORS.PRIMARY}20`,
    marginLeft: SPACING.SMALL,
  },
  contactDetails: {
    flexDirection: 'column',
  },
  contactDetail: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginBottom: 2,
  },
  contactDate: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginTop: 2,
  },
  dueDateContainer: {
    alignItems: 'center',
    padding: SPACING.SMALL,
    backgroundColor: `${COLORS.PRIMARY}15`,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  dueDate: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    marginBottom: 2,
  },
  dueLabel: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  gridItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    width: '48%',
    alignItems: 'center',
    ...EFFECTS.SHADOW_SMALL,
  },
  gridAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    position: 'relative',
  },
  gridInitials: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.BACKGROUND,
  },
  gridCategoryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
  },
  gridDueDateContainer: {
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    backgroundColor: `${COLORS.PRIMARY}15`,
    borderRadius: BORDER_RADIUS.SMALL,
    marginTop: SPACING.TINY,
  },
  gridDueDate: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  gridLastContacted: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginTop: SPACING.TINY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    overflow: 'hidden',
    ...EFFECTS.SHADOW_MEDIUM,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  modalContent: {
    maxHeight: 350,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalOptionSelected: {
    backgroundColor: `${COLORS.PRIMARY}15`,
  },
  modalOptionText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
  },
  modalOptionTextSelected: {
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.PRIMARY,
  },
  statusCounter: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD,
  },
  statusText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.LARGE,
    right: SPACING.LARGE,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...EFFECTS.GLOW_PRIMARY,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.XLARGE,
  },
  loaderText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.XLARGE,
    padding: SPACING.LARGE,
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.BACKGROUND,
    fontWeight: 'bold',
  },
}); 