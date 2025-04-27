import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { fetchContacts } from '@/app/core/store/slices/contactsSlice';
import { fetchTravelContactLinks, linkContactToTravel } from '@/app/core/store/slices/travelSlice';
import { Contact } from '@/app/core/types/contact';

export default function TravelContactsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { contacts, isLoading: contactsLoading } = useAppSelector((state) => state.contacts);
  const { travelContactLinks, isLoading: travelLinksLoading } = useAppSelector((state) => state.travel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    dispatch(fetchContacts());
    if (id) {
      dispatch(fetchTravelContactLinks(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    // Initialize selected contacts based on existing links
    const initialSelected = {};
    travelContactLinks.forEach(link => {
      initialSelected[link.contact_id] = link.notify;
    });
    setSelectedContacts(initialSelected);
  }, [travelContactLinks]);
  
  const toggleContactSelection = (contactId: string, selected: boolean) => {
    setSelectedContacts(prev => ({
      ...prev,
      [contactId]: selected
    }));
  };
  
  const handleSaveContacts = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const savePromises = Object.entries(selectedContacts).map(([contactId, notify]) => {
        return dispatch(linkContactToTravel({
          travel_plan_id: id,
          contact_id: contactId,
          notify
        })).unwrap();
      });
      
      await Promise.all(savePromises);
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to link contacts to travel plan. Please try again.',
        [{ text: 'OK' }]
      );
      setIsSaving(false);
    }
  };
  
  const filteredContacts = contacts.filter(contact => {
    return contact.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts[item.id] !== undefined;
    const willNotify = selectedContacts[item.id] === true;
    
    return (
      <View style={styles.contactRow}>
        <View style={styles.contactInfo}>
          <View style={styles.contactInitials}>
            <Text style={styles.initialsText}>
              {item.full_name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View>
            <Text style={styles.contactName}>{item.full_name}</Text>
            {item.email && (
              <Text style={styles.contactDetail}>{item.email}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.selectContainer}>
          {isSelected && (
            <Switch
              value={willNotify}
              onValueChange={(value) => toggleContactSelection(item.id, value)}
              trackColor={{ false: COLORS.GRAY_DARK, true: COLORS.PRIMARY_DARK }}
              thumbColor={willNotify ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
              ios_backgroundColor={COLORS.GRAY_DARK}
              style={styles.switch}
            />
          )}
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected ? styles.selectedButton : null
            ]}
            onPress={() => toggleContactSelection(item.id, !isSelected)}
          >
            {isSelected ? (
              <Ionicons name="checkmark" size={20} color={COLORS.BACKGROUND} />
            ) : (
              <Text style={styles.selectButtonText}>Select</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const isLoading = contactsLoading || travelLinksLoading;
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Link Contacts',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveContacts}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
        
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Select contacts to link to your trip</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.PRIMARY }]} />
            <Text style={styles.legendText}>Toggle notification</Text>
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.contactsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'No contacts found matching your search' 
                    : 'No contacts available. Add some contacts first!'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity 
                    style={styles.addContactButton}
                    onPress={() => router.push('/contacts/new')}
                  >
                    <Text style={styles.addContactText}>Add Contact</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
        
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.saveAllButton}
            onPress={handleSaveContacts}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
            ) : (
              <Text style={styles.saveAllText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  saveButton: {
    paddingHorizontal: SPACING.MEDIUM,
  },
  saveButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratSemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    marginTop: SPACING.MEDIUM,
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
  legend: {
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  legendTitle: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratSemiBold',
    marginBottom: SPACING.SMALL,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.SMALL,
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
  contactsList: {
    paddingHorizontal: SPACING.LARGE,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  initialsText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
    fontSize: FONT_SIZES.SMALL,
  },
  contactName: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratMedium',
    marginBottom: 2,
  },
  contactDetail: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.SMALL,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginRight: SPACING.SMALL,
  },
  selectButton: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  selectButtonText: {
    color: COLORS.PRIMARY,
    fontFamily: 'MontserratMedium',
    fontSize: FONT_SIZES.SMALL,
  },
  emptyContainer: {
    paddingVertical: SPACING.XXLARGE,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  addContactButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
  },
  addContactText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
  },
  bottomBar: {
    backgroundColor: COLORS.CARD,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  saveAllButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveAllText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
    fontSize: FONT_SIZES.MEDIUM,
  }
}); 