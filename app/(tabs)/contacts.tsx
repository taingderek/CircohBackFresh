import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';

// Sample data
const SAMPLE_CONTACTS = [
  { id: '1', name: 'Sarah Johnson', category: 'friend', lastContacted: '2 weeks ago' },
  { id: '2', name: 'Michael Brown', category: 'family', lastContacted: '3 days ago' },
  { id: '3', name: 'Emma Wilson', category: 'colleague', lastContacted: '1 month ago' },
  { id: '4', name: 'James Thompson', category: 'friend', lastContacted: '1 week ago' },
  { id: '5', name: 'Lisa Anderson', category: 'family', lastContacted: 'Today' },
  { id: '6', name: 'David Martin', category: 'colleague', lastContacted: '3 weeks ago' },
  { id: '7', name: 'Jennifer Garcia', category: 'friend', lastContacted: '2 days ago' },
  { id: '8', name: 'Robert Miller', category: 'family', lastContacted: '5 days ago' },
  { id: '9', name: 'Elizabeth Davis', category: 'colleague', lastContacted: '2 months ago' },
  { id: '10', name: 'William Rodriguez', category: 'friend', lastContacted: '1 day ago' },
];

export default function ContactsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Filter contacts based on search query and category
  const filteredContacts = SAMPLE_CONTACTS.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  
  const renderCategoryButton = (category: string, label: string, icon: string) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton, 
        filterCategory === category && styles.activeCategoryButton
      ]}
      onPress={() => setFilterCategory(category)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={filterCategory === category ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY} 
      />
      <Text 
        style={[
          styles.categoryButtonText,
          filterCategory === category && styles.activeCategoryText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderContact = ({ item }: { item: typeof SAMPLE_CONTACTS[0] }) => (
    <Pressable style={styles.contactCard}>
      <View style={styles.contactInitials}>
        <Text style={styles.initialsText}>
          {item.name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.name}</Text>
        <View style={styles.contactCategoryContainer}>
          <Text style={styles.contactCategory}>{item.category}</Text>
        </View>
        <Text style={styles.lastContacted}>Last contacted: {item.lastContacted}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
    </Pressable>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Contacts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>
      
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
            <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.categories}>
        {renderCategoryButton('all', 'All', 'people-outline')}
        {renderCategoryButton('friend', 'Friends', 'heart-outline')}
        {renderCategoryButton('family', 'Family', 'home-outline')}
        {renderCategoryButton('colleague', 'Colleagues', 'briefcase-outline')}
      </View>
      
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contactsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No contacts found</Text>
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
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
    marginRight: SPACING.SMALL,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
    fontFamily: 'MontserratMedium',
  },
  activeCategoryText: {
    color: COLORS.BACKGROUND,
  },
  contactsList: {
    paddingBottom: SPACING.LARGE,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  contactInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  initialsText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratBold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 2,
    fontFamily: 'MontserratSemiBold',
  },
  contactCategoryContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  contactCategory: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'capitalize',
    fontFamily: 'MontserratRegular',
  },
  lastContacted: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
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
    fontFamily: 'MontserratRegular',
  },
}); 