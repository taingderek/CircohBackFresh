import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { COLORS, SPACING, FONT_SIZES, EFFECTS, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import { calculateUserStreak, getStreakRequirementsForToday, logStreakActivity } from '@/app/features/streaks/service';
import { UserStreak, StreakRequirement } from '@/app/features/streaks/types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StreakCalendar from '../../components/dashboard/StreakCalendar';
import { streakService } from '@/app/core/services';
// Comment out components that don't exist yet
// import StreakInsights from '../../components/dashboard/StreakInsights';
// import ContactItem from '../../components/daily/ContactItem';
// import ContactStreakIndicator from '../../components/daily/ContactStreakIndicator';
// import StatsCard from '../../components/common/StatsCard';
// import RequirementItem from '../../components/dashboard/RequirementItem';

// Mock data for relationships at risk and suggested contacts
// TODO: Replace with real data fetching
const AT_RISK_CONTACTS = [
  {
    id: '1',
    name: 'Sara Kim',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    currentStreak: 14,
    gracePeriodEnds: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatarUrl: null,
    currentStreak: 7,
    gracePeriodEnds: new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toISOString(),
  }
];

const SUGGESTED_CONTACTS = [
  {
    id: '3',
    name: 'Jessica Chen',
    avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    lastContactDate: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
  },
  {
    id: '4',
    name: 'David Park',
    avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
    lastContactDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
  }
];

// Temporary placeholder components
const StreakInsights: React.FC<{ userId: string, isPremium: boolean }> = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Streak Insights</Text>
    <View style={{ padding: SPACING.MEDIUM, backgroundColor: COLORS.CARD, borderRadius: BORDER_RADIUS.MEDIUM }}>
      <Text style={{ color: COLORS.TEXT_SECONDARY }}>Streak insights will appear here</Text>
    </View>
  </View>
);

const StatsCard: React.FC<{ title: string, value: string, subtitle: string, icon: string, color: string, style?: any }> = (props) => (
  <View style={[{ flex: 1, padding: SPACING.MEDIUM, backgroundColor: COLORS.CARD, borderRadius: BORDER_RADIUS.MEDIUM }, props.style]}>
    <Text style={{ color: COLORS.TEXT, fontWeight: 'bold' }}>{props.title}</Text>
    <Text style={{ color: props.color, fontSize: 24, fontWeight: 'bold' }}>{props.value}</Text>
    <Text style={{ color: COLORS.TEXT_SECONDARY }}>{props.subtitle}</Text>
  </View>
);

const ContactItem: React.FC<{ contact: any, rightComponent?: React.ReactNode, subtitle?: string, priority?: string, onPress: () => void }> = (props) => (
  <TouchableOpacity 
    style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.MEDIUM, backgroundColor: COLORS.CARD, borderRadius: BORDER_RADIUS.MEDIUM, marginBottom: SPACING.SMALL }}
    onPress={props.onPress}
  >
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.PRIMARY, marginRight: SPACING.MEDIUM }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: COLORS.TEXT, fontWeight: 'bold' }}>{props.contact.name}</Text>
      {props.subtitle && <Text style={{ color: COLORS.TEXT_SECONDARY }}>{props.subtitle}</Text>}
    </View>
    {props.rightComponent}
  </TouchableOpacity>
);

const ContactStreakIndicator: React.FC<{ streakCount: number, status: string, gracePeriodEnds: string }> = (props) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ color: COLORS.WARNING, fontWeight: 'bold' }}>{props.streakCount}</Text>
    <Text style={{ color: COLORS.TEXT_SECONDARY }}>days</Text>
  </View>
);

const RequirementItem: React.FC<{ requirement: any, onComplete: () => void }> = (props) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.SMALL }}>
    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: props.requirement.isCompleted ? COLORS.SUCCESS : COLORS.BORDER, marginRight: SPACING.SMALL }} />
    <Text style={{ flex: 1, color: COLORS.TEXT }}>{props.requirement.title}</Text>
  </View>
);

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  
  // Auth and user state
  // TODO: Get from redux store
  const userId = 'current-user-id';
  const isPremium = false;
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [todayRequirements, setTodayRequirements] = useState<StreakRequirement[]>([]);
  const [atRiskContacts, setAtRiskContacts] = useState(AT_RISK_CONTACTS);
  const [suggestedContacts, setSuggestedContacts] = useState(SUGGESTED_CONTACTS);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [streakDates, setStreakDates] = useState<Date[]>([]);
  
  // Load data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Log user activity for streak
      await logStreakActivity(userId);
      
      // Get user streak info
      const streak = await calculateUserStreak(userId);
      setUserStreak(streak);
      
      // Get today's streak requirements/tasks
      const requirements = await getStreakRequirementsForToday(userId);
      setTodayRequirements(requirements);
      
      // Calculate completion
      const completed = requirements.filter(req => req.isCompleted).length;
      const total = requirements.length;
      
      setCompletedActivities(completed);
      setTotalActivities(total);
      
      // Get real streak dates from streakService
      try {
        const streaks = await streakService.getUserStreaks();
        // Convert the streak activity dates to Date objects for the calendar
        if (streaks && streaks.length > 0) {
          // Find the app usage streak
          const appUsageStreak = streaks.find(s => s.streakType === 'app_usage');
          if (appUsageStreak) {
            // Generate dates from current streak count
            const dates: Date[] = [];
            const today = new Date();
            
            // Add today
            dates.push(today);
            
            // Add previous days based on streak count
            for (let i = 1; i < appUsageStreak.currentCount; i++) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              dates.push(date);
            }
            
            setStreakDates(dates);
          }
        }
      } catch (streakError) {
        console.error('Error fetching streak data:', streakError);
        // Fallback to simple streak dates if there's an error
        const fallbackDates = [
          new Date(new Date().setDate(new Date().getDate() - 5)),
          new Date(new Date().setDate(new Date().getDate() - 4)),
          new Date(new Date().setDate(new Date().getDate() - 3)),
          new Date(new Date().setDate(new Date().getDate() - 1)),
          new Date()
        ];
        setStreakDates(fallbackDates);
      }
      
      // TODO: Get at-risk contacts and suggested contacts from API
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  }, [userId]);
  
  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);
  
  // Load data initially and when screen comes into focus
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );
  
  // Format the current date for display
  const formattedDate = format(new Date(), 'EEEE, MMMM d');
  
  // Handle month change for calendar
  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    // In a real app, you might want to fetch streak data for the new month
  };

  // Handle day press on calendar
  const handleDayPress = (date: Date) => {
    // Navigate to day detail or show activities for this day
    console.log('Day pressed:', date);
  };
  
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date */}
        <Text style={styles.dateText}>{formattedDate}</Text>
        
        {/* Streak Header */}
        {userStreak && (
          <DashboardHeader 
            streakDays={userStreak.currentStreakDays}
            longestStreak={userStreak.longestStreakDays}
            multiplier={userStreak.currentMultiplier}
            level={userStreak.level}
            points={userStreak.totalPoints}
            pointsToNextLevel={userStreak.pointsToNextLevel}
          />
        )}
        
        {/* Today's Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${totalActivities ? (completedActivities / totalActivities) * 100 : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedActivities}/{totalActivities}
            </Text>
          </View>
          
          <View style={styles.requirementsList}>
            {todayRequirements.map((requirement, index) => (
              <RequirementItem 
                key={`req-${index}`}
                requirement={requirement}
                onComplete={() => {
                  // TODO: Handle completion
                }}
              />
            ))}
          </View>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard 
            title="Active Streaks"
            value="28"
            subtitle="Relationships"
            icon="flame"
            color={COLORS.SUCCESS}
            style={{ marginRight: SPACING.SMALL }}
          />
          <StatsCard 
            title="At Risk"
            value={atRiskContacts.length.toString()}
            subtitle="Contacts"
            icon="alert-circle"
            color={COLORS.WARNING}
          />
        </View>
        
        {/* Calendar */}
        <StreakCalendar 
          currentDate={currentDate}
          streakDates={streakDates}
          onMonthChange={handleMonthChange}
          onDayPress={handleDayPress}
        />
        
        {/* At-Risk Relationships */}
        {atRiskContacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Streaks at Risk</Text>
              <Text 
                style={styles.sectionAction}
                onPress={() => navigation.navigate('RelationshipStreaks' as never)}
              >
                See All
              </Text>
            </View>
            
            {atRiskContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={{
                  id: contact.id,
                  name: contact.name,
                  avatarUrl: contact.avatarUrl,
                }}
                rightComponent={
                  <ContactStreakIndicator 
                    streakCount={contact.currentStreak}
                    status="at_risk"
                    gracePeriodEnds={contact.gracePeriodEnds}
                  />
                }
                onPress={() => {
                  // TODO: Navigate to contact detail
                }}
              />
            ))}
          </View>
        )}
        
        {/* Suggested Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Connections</Text>
            <Text 
              style={styles.sectionAction}
              onPress={() => {
                // TODO: Navigate to suggested connections
              }}
            >
              See All
            </Text>
          </View>
          
          {suggestedContacts.map(contact => (
            <ContactItem
              key={contact.id}
              contact={{
                id: contact.id,
                name: contact.name,
                avatarUrl: contact.avatarUrl,
              }}
              subtitle={`Last contacted ${format(new Date(contact.lastContactDate), 'MMM d')}`}
              priority={contact.priority}
              onPress={() => {
                // TODO: Navigate to contact detail
              }}
            />
          ))}
        </View>
        
        {/* Insights */}
        <StreakInsights userId={userId} isPremium={isPremium} />
        
        {/* Bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  dateText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONT_FAMILIES.REGULAR,
    marginBottom: SPACING.SMALL,
  },
  statusCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginVertical: SPACING.MEDIUM,
    ...EFFECTS.SHADOW_SMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    marginBottom: SPACING.SMALL,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: SPACING.SMALL,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  requirementsList: {
    marginTop: SPACING.SMALL,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  section: {
    marginVertical: SPACING.MEDIUM,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  sectionAction: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default DashboardScreen; 