import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '@/app/core/constants/theme';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { 
  fetchTravelPlan, 
  fetchTravelContactLinks,
  deleteTravelPlan
} from '@/app/core/store/slices/travelSlice';
import { formatDate } from '@/app/core/utils/dateUtils';

export default function TravelPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedTravelPlan, travelContactLinks, isLoading, error } = useAppSelector((state) => state.travel);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchTravelPlan(id));
      dispatch(fetchTravelContactLinks(id));
    }
  }, [dispatch, id]);
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Travel Plan",
      "Are you sure you want to delete this travel plan? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await dispatch(deleteTravelPlan(id)).unwrap();
              router.replace("/travel");
            } catch (error) {
              Alert.alert("Error", "Failed to delete travel plan");
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
  
  if (isLoading || !selectedTravelPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading travel plan details...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.ERROR} />
        <Text style={styles.errorText}>Failed to load travel plan details</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            dispatch(fetchTravelPlan(id));
            dispatch(fetchTravelContactLinks(id));
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const startDate = new Date(selectedTravelPlan.start_date);
  const endDate = new Date(selectedTravelPlan.end_date);
  const isActive = startDate <= new Date() && endDate >= new Date();
  const isPast = endDate < new Date();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: selectedTravelPlan.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push({
                  pathname: "/travel/edit",
                  params: { id: selectedTravelPlan.id }
                })}
                disabled={isDeleting}
              >
                <Ionicons name="create-outline" size={24} color={COLORS.TEXT} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.ERROR} />
                ) : (
                  <Ionicons name="trash-outline" size={24} color={COLORS.ERROR} />
                )}
              </TouchableOpacity>
            </View>
          )
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="airplane" 
                size={32} 
                color={isPast ? COLORS.TEXT_SECONDARY : (isActive ? COLORS.PRIMARY : COLORS.ACCENT)}
              />
            </View>
            <Text style={styles.title}>{selectedTravelPlan.title}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="location-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.infoLabelText}>Destination</Text>
              </View>
              <Text style={styles.infoValue}>{selectedTravelPlan.destination}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.infoLabelText}>Dates</Text>
              </View>
              <Text style={styles.infoValue}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.infoLabelText}>Status</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                isPast ? styles.pastBadge : (isActive ? styles.activeBadge : styles.upcomingBadge)
              ]}>
                <Text style={styles.statusText}>
                  {isPast ? 'Past' : (isActive ? 'Active' : 'Upcoming')}
                </Text>
              </View>
            </View>
            
            {selectedTravelPlan.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{selectedTravelPlan.description}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Notifications</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push({
                pathname: "/travel/contacts",
                params: { id: selectedTravelPlan.id }
              })}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          
          {travelContactLinks.length > 0 ? (
            <View style={styles.contactsCard}>
              {travelContactLinks.map((link) => (
                <View key={link.id} style={styles.contactRow}>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactInitials}>
                      <Text style={styles.initialsText}>
                        {link.contact.full_name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.contactName}>{link.contact.full_name}</Text>
                      {link.notify && (
                        <Text style={styles.notificationStatus}>
                          {link.notified_at ? 'Notified on ' + formatDate(new Date(link.notified_at)) : 'Will be notified'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({
                      pathname: "/contacts/[id]",
                      params: { id: link.contact_id }
                    })}
                  >
                    <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContactsCard}>
              <Ionicons name="people-outline" size={36} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyText}>No contacts linked to this trip</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push({
                  pathname: "/travel/contacts",
                  params: { id: selectedTravelPlan.id }
                })}
              >
                <Text style={styles.linkButtonText}>Link Contacts</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push({
                pathname: "/travel/map",
                params: { id: selectedTravelPlan.id }
              })}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.BACKGROUND} />
              <Text style={styles.actionButtonText}>View Map</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push({
                pathname: "/travel/nearby",
                params: { id: selectedTravelPlan.id }
              })}
            >
              <Ionicons name="people-outline" size={20} color={COLORS.BACKGROUND} />
              <Text style={styles.actionButtonText}>Find Contacts Nearby</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
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
    backgroundColor: COLORS.BACKGROUND,
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
  header: {
    padding: SPACING.LARGE,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontFamily: 'MontserratBold',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.LARGE,
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabelText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratMedium',
    marginLeft: SPACING.SMALL,
  },
  infoValue: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratSemiBold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadge: {
    backgroundColor: COLORS.ACCENT,
  },
  activeBadge: {
    backgroundColor: COLORS.PRIMARY,
  },
  pastBadge: {
    backgroundColor: COLORS.GRAY_DARK,
  },
  statusText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
    fontSize: FONT_SIZES.SMALL,
  },
  descriptionContainer: {
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  descriptionLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratMedium',
    marginBottom: SPACING.SMALL,
  },
  descriptionText: {
    color: COLORS.TEXT,
    fontFamily: 'MontserratRegular',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: 'MontserratSemiBold',
    color: COLORS.TEXT,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  notificationStatus: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    fontSize: FONT_SIZES.SMALL,
  },
  emptyContactsCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    padding: SPACING.LARGE,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'MontserratRegular',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
  },
  linkButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
  },
  buttonContainer: {
    padding: SPACING.LARGE,
    gap: SPACING.MEDIUM,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 12,
    gap: SPACING.SMALL,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  actionButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: 'MontserratSemiBold',
    fontSize: FONT_SIZES.MEDIUM,
  },
}); 