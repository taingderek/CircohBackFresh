import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import { Conversation, conversationService } from '@/app/core/services/conversationService';
import { useIsFocused } from '@react-navigation/native';

// Filter options for conversation categories
const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'family', label: 'Family' },
  { id: 'closeFriends', label: 'Close Friends' },
  { id: 'work', label: 'Work' },
  { id: 'needs_attention', label: 'Needs Attention' },
];

// Main Messages Tab Component
export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const scrollY = new Animated.Value(0);
  const isFocused = useIsFocused();

  // Fetch conversations from Supabase
  const fetchConversations = async () => {
    try {
      setError(null);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh conversations
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
  };

  // Load conversations when the screen comes into focus
  useEffect(() => {
    if (isFocused) {
      fetchConversations();
    }
  }, [isFocused]);

  // Filter conversations based on active filter and search query
  const filteredConversations = conversations.filter(conversation => {
    // Apply category filter
    if (activeFilter !== 'all' && activeFilter !== 'needs_attention') {
      if (conversation.category.toLowerCase() !== activeFilter.toLowerCase()) {
        return false;
      }
    }
    
    // Apply "needs attention" filter
    if (activeFilter === 'needs_attention') {
      const daysSinceLastInteraction = differenceInDays(
        new Date(),
        conversation.lastMeaningfulInteraction
      );
      if (daysSinceLastInteraction < 30) { // Example threshold: 30 days
        return false;
      }
    }
    
    // Apply search query filter
    if (searchQuery) {
      return conversation.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  // Create animated header values for collapsing header effect
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [180, 80],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const filterBarTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  // Format timestamp for display
  const formatMessageTime = (timestamp: Date): string => {
    if (isToday(timestamp)) {
      return format(timestamp, 'h:mm a');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM d');
    }
  };

  // Render sentiment indicator
  const renderSentimentIndicator = (sentiment: 'positive' | 'negative' | 'neutral') => {
    let color = COLORS.CYAN; // Default cyan for neutral
    
    if (sentiment === 'positive') {
      color = COLORS.PRIMARY; // Mint green
    } else if (sentiment === 'negative') {
      color = COLORS.ACCENT; // Pink
    }
    
    return (
      <View style={[styles.sentimentIndicator, { backgroundColor: color }]} />
    );
  };

  // Render a single conversation item
  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const daysSinceLastInteraction = differenceInDays(
      new Date(),
      item.lastMeaningfulInteraction
    );
    
    // Determine if this conversation needs attention
    const needsAttention = daysSinceLastInteraction > 30;
    
    return (
      <View style={styles.shadowContainer}>
        <TouchableOpacity 
          style={[
            styles.conversationItem,
            item.unread && styles.unreadConversation
          ]}
          onPress={() => navigateToConversation(item)}
        >
          {/* Left column: Avatar & CircohBack Score */}
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.avatar}
              defaultSource={require('../../assets/favicon.png')}
            />
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{item.circohBackScore.toFixed(1)}</Text>
            </View>
          </View>
          
          {/* Middle column: Contact info & Last message */}
          <View style={styles.conversationInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName} numberOfLines={1}>{item.contactName}</Text>
              <Text style={styles.timestamp}>{formatMessageTime(item.timestamp)}</Text>
            </View>
            
            <Text style={[
              styles.lastMessage,
              item.unread && styles.unreadText
            ]} numberOfLines={2}>
              {item.lastMessage}
            </Text>
            
            {/* Memory prompt peek */}
            {item.memoryPrompts && item.memoryPrompts.length > 0 && (
              <View style={styles.memoryPromptContainer}>
                <Text style={styles.memoryPromptText} numberOfLines={1}>
                  💭 {item.memoryPrompts[0]}
                </Text>
              </View>
            )}
          </View>
          
          {/* Right column: Indicators */}
          <View style={styles.indicatorsContainer}>
            {renderSentimentIndicator(item.sentiment)}
            
            {item.hasGratitudeMoment && (
              <View style={styles.gratitudeIndicator}>
                <Text style={styles.gratitudeText}>❤️</Text>
              </View>
            )}
            
            {needsAttention && (
              <View style={styles.attentionIndicator}>
                <Text style={styles.attentionText}>!</Text>
              </View>
            )}
            
            {item.unread && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Navigate to individual conversation
  const navigateToConversation = async (conversation: Conversation) => {
    console.log('Navigate to conversation with:', conversation.contactName);
    
    // Mark conversation as read when navigating to it
    if (conversation.unread) {
      try {
        await conversationService.markConversationAsRead(conversation.contactId);
        
        // Update the local state to reflect the read status
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversation.id 
              ? { ...conv, unread: false } 
              : conv
          )
        );
      } catch (err) {
        console.error('Error marking conversation as read:', err);
      }
    }
    
    // TODO: Implement actual navigation to conversation screen
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[
        styles.header,
        { height: headerHeight, paddingTop: insets.top }
      ]}>
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Stay connected with the people who matter</Text>
        </Animated.View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Filter Bar */}
        <Animated.View style={[
          styles.filterContainer,
          { transform: [{ translateY: filterBarTranslate }] }
        ]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === item.id && styles.activeFilterButton
                ]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text style={[
                  styles.filterText,
                  activeFilter === item.id && styles.activeFilterText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterList}
          />
        </Animated.View>
      </Animated.View>
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchConversations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Conversation List */}
      <Animated.FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.conversationList}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No messages found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter !== 'all' 
                ? `Try changing your filter or start a new conversation`
                : `Start a new conversation to stay connected`
              }
            </Text>
            <TouchableOpacity style={styles.newMessageButton}>
              <Text style={styles.newMessageButtonText}>Start New Message</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* New Message Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <LinearGradient
          colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles
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
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  errorContainer: {
    backgroundColor: `${COLORS.ERROR}20`,
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: COLORS.ERROR,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    marginLeft: SPACING.SMALL,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: FONT_SIZES.SMALL,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.MEDIUM,
    justifyContent: 'flex-end',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerContent: {
    marginBottom: SPACING.MEDIUM,
  },
  headerTitle: {
    fontSize: FONT_SIZES.XXXL,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  searchContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  searchInput: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
  },
  filterContainer: {
    marginBottom: SPACING.SMALL,
  },
  filterList: {
    paddingRight: SPACING.MEDIUM,
  },
  filterButton: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.CARD,
    marginRight: SPACING.SMALL,
  },
  activeFilterButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  activeFilterText: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  conversationList: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.SMALL,
    paddingBottom: 100,
  },
  shadowContainer: {
    width: '100%',
    marginBottom: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.LARGE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  conversationItem: {
    flexDirection: 'row',
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.LARGE,
    backgroundColor: COLORS.CARD,
  },
  unreadConversation: {
    backgroundColor: '#222222',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: SPACING.MEDIUM,
  },
  scoreContainer: {
    position: 'absolute',
    bottom: -5,
    right: 8,
    backgroundColor: COLORS.SECONDARY,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  scoreText: {
    color: COLORS.BACKGROUND,
    fontSize: 10,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  conversationInfo: {
    flex: 1,
    marginRight: SPACING.SMALL,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    flex: 1,
  },
  timestamp: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SMALL,
  },
  lastMessage: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  unreadText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.MEDIUM,
  },
  memoryPromptContainer: {
    backgroundColor: `${COLORS.SECONDARY}25`,
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    marginTop: SPACING.TINY,
  },
  memoryPromptText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.SECONDARY,
  },
  indicatorsContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: SPACING.TINY,
  },
  sentimentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.SMALL,
  },
  gratitudeIndicator: {
    marginBottom: SPACING.SMALL,
  },
  gratitudeText: {
    fontSize: FONT_SIZES.SMALL,
  },
  attentionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  attentionText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradientButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 30,
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XLARGE,
    marginTop: SPACING.XLARGE,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
  newMessageButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  newMessageButtonText: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILIES.BOLD,
    fontSize: FONT_SIZES.MEDIUM,
  },
}); 