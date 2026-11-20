import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchField } from '../../components/common/SearchField';
import { FilterChips } from '../../components/common/FilterChips';
import { SectionHeader } from '../../components/common/SectionHeader';
import { OpportunityCard } from '../../components/opportunity/OpportunityCard';
import { OpportunityListItem } from '../../components/opportunity/OpportunityListItem';
import { Avatar } from '../../components/common/Avatar';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useOpportunityStore } from '../../store/opportunityStore';
import { contentService, PostResponseDto } from '../../services/contentService';
import { getScopedCache, saveScopedCache } from '../../lib/queryClient';
import { CampusEvent } from '../../types/models';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HOME_CATEGORIES = [
  'All',
  'Internships',
  'Jobs',
  'Hackathons',
  'Workshops',
  'Events',
] as const;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { styles, colors, isDark } = useThemedStyles(createStyles);
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Granular Zustand selectors to prevent full-screen re-renders
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const events = useOpportunityStore((state) => state.events);
  const isLoading = useOpportunityStore((state) => state.isLoading);
  const error = useOpportunityStore((state) => state.error);
  const fetchOpportunities = useOpportunityStore((state) => state.fetchOpportunities);
  const fetchEvents = useOpportunityStore((state) => state.fetchEvents);

  const [communityPosts, setCommunityPosts] = useState<PostResponseDto[]>(
    () => getScopedCache<PostResponseDto[]>('feed_home') || []
  );

  const fetchFeed = async () => {
    try {
      const res = await contentService.getFeed('All', 0, 5);
      if (res.success && res.data && res.data.length > 0) {
        setCommunityPosts(res.data);
        saveScopedCache('feed_home', res.data);
      } else if (communityPosts.length === 0) {
        setCommunityPosts([]);
      }
    } catch {
      // Keep existing cached posts if fetch fails
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchEvents();
    fetchFeed();
  }, [fetchOpportunities, fetchEvents]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchOpportunities(), fetchEvents(), fetchFeed()]);
    setIsRefreshing(false);
  };

  // Filter opportunities based on selected quick category or search
  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedHomeCategory === 'Internships' && opp.type !== 'Internship') return false;
    if (selectedHomeCategory === 'Jobs' && opp.type !== 'Job') return false;
    if (selectedHomeCategory === 'Hackathons' && opp.type !== 'Hackathon') return false;
    if (selectedHomeCategory === 'Workshops' && opp.type !== 'Workshop') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const featuredOpportunities = opportunities.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <AppHeader
        title="UPLINK"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onMessagePress={() => navigation.navigate('Conversations')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      <FlatList
        data={filteredOpportunities}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <SearchField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search opportunities, roles, skills..."
                onClear={() => setSearchQuery('')}
              />
            </View>

            {/* AI Career Coach & Resume Studio Spotlight Card */}
            {!searchQuery && (
              <View style={styles.aiBanner}>
                <View style={styles.aiBannerHeader}>
                  <View style={styles.aiIconBadge}>
                    <Icon name="sparkles" size={16} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiBannerTitle}>AI Career Coach & Resume Studio</Text>
                    <Text style={styles.aiBannerSubtitle}>
                      Live mock interviews, tailored ATS resumes, and career coaching
                    </Text>
                  </View>
                </View>
                <View style={styles.aiBannerButtons}>
                  <TouchableOpacity
                    style={styles.aiPrimaryBtn}
                    onPress={() => navigation.navigate('AIChat')}
                    activeOpacity={0.8}
                  >
                    <Icon name="sparkles" size={14} color="#FFFFFF" />
                    <Text style={styles.aiPrimaryBtnText}>Open AI Coach</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aiSecondaryBtn}
                    onPress={() => navigation.navigate('ResumeBuilder')}
                    activeOpacity={0.8}
                  >
                    <Icon name="file-text" size={14} color={colors.primary} />
                    <Text style={styles.aiSecondaryBtnText}>Resume Studio</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Filter Horizontal Scroll */}
            <FilterChips
              items={HOME_CATEGORIES as any}
              selectedId={selectedHomeCategory}
              onSelect={(id) => setSelectedHomeCategory(id)}
            />

            {isLoading && !isRefreshing && (
              <LoadingState message="Loading opportunities & campus feed..." />
            )}

            {error && !isLoading && (
              <ErrorState message={error} onRetry={fetchOpportunities} />
            )}

            {!isLoading && !error && (
              <>
                {/* Featured / Carousel Section */}
                {selectedHomeCategory === 'All' && !searchQuery && featuredOpportunities.length > 0 && (
                  <View style={styles.sectionWrapper}>
                    <SectionHeader
                      title="Featured Opportunities"
                      actionLabel="See all"
                      onActionPress={() => navigation.navigate('Jobs', undefined)}
                    />
                    <FlatList
                      data={featuredOpportunities}
                      keyExtractor={(item) => `feat-${item.id}`}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      renderItem={({ item }) => (
                        <OpportunityCard
                          opportunity={item}
                          onPress={() =>
                            navigation.navigate('OpportunityDetail', {
                              opportunityId: item.id,
                            })
                          }
                        />
                      )}
                    />
                  </View>
                )}

                {/* Campus Community Feed / Peer Discussions */}
                {selectedHomeCategory === 'All' && !searchQuery && communityPosts.length > 0 && (
                  <View style={styles.sectionWrapper}>
                    <SectionHeader
                      title="Campus Community Feed"
                      actionLabel="Explore Network"
                      onActionPress={() => navigation.navigate('Network')}
                    />
                    <View style={styles.feedContainer}>
                      {communityPosts.map((item) => (
                        <View key={item.post.id} style={styles.postCard}>
                          <View style={styles.postHeader}>
                            {/* Avatar wrapped in TouchableOpacity navigating to PublicProfile */}
                            <TouchableOpacity
                              style={styles.avatarTouchable}
                              onPress={() => {
                                if (item.post?.user?.id) {
                                  navigation.navigate('PublicProfile', {
                                    userId: item.post.user.id,
                                    fullName: item.post.user.fullName,
                                  });
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Avatar name={item.post?.user?.fullName || 'Peer'} size={38} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.postAuthorInfo}
                              onPress={() => {
                                if (item.post?.user?.id) {
                                  navigation.navigate('PublicProfile', {
                                    userId: item.post.user.id,
                                    fullName: item.post.user.fullName,
                                  });
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.postAuthorName}>{item.post.user?.fullName}</Text>
                              <Text style={styles.postTimestamp}>
                                {item.post.type || 'Post'} • {item.post.createdAt ? new Date(item.post.createdAt).toLocaleDateString() : 'Recent'}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <Text style={styles.postContentText}>{item.post.content}</Text>

                          <View style={styles.postFooter}>
                            <View style={styles.postStatItem}>
                              <Icon name="thumbs-up" size={13} color={colors.textSecondary} />
                              <Text style={styles.postStatText}>{item.likeCount} likes</Text>
                            </View>
                            <View style={styles.postStatItem}>
                              <Icon name="message-square" size={13} color={colors.textSecondary} />
                              <Text style={styles.postStatText}>{item.commentCount} comments</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Upcoming Campus Notices / Events */}
                {selectedHomeCategory === 'All' && !searchQuery && events.length > 0 && (
                  <View style={styles.sectionWrapper}>
                    <SectionHeader title="Campus Notices & Events" />
                    <View style={styles.eventsContainer}>
                      {events.map((event: CampusEvent) => (
                        <View key={event.id} style={styles.eventCard}>
                          <View style={styles.eventBadge}>
                            <Icon name="calendar" size={14} color={colors.primary} />
                            <Text style={styles.eventDateText}>{event.date}</Text>
                          </View>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventSubtitle}>
                            {event.organization} • {event.location}
                          </Text>
                          <Text style={styles.eventTimeText}>{event.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Main Opportunities List Header */}
                <View style={styles.sectionWrapper}>
                  <SectionHeader
                    title={
                      selectedHomeCategory === 'All'
                        ? 'Explore Opportunities'
                        : selectedHomeCategory
                    }
                    actionLabel="View all"
                    onActionPress={() => navigation.navigate('Jobs', undefined)}
                  />

                  {filteredOpportunities.length === 0 && (
                    <EmptyState
                      title="No Opportunities Found"
                      description="Try adjusting your filter or search criteria to discover more openings."
                      icon="briefcase"
                      actionLabel="Reset Filters"
                      onActionPress={() => {
                        setSelectedHomeCategory('All');
                        setSearchQuery('');
                      }}
                    />
                  )}
                  
                  {filteredOpportunities.length > 0 && (
                    <View style={styles.listContainerTopBorder} />
                  )}
                </View>
              </>
            )}
          </>
        }
        renderItem={({ item }) => (
          <OpportunityListItem
            opportunity={item}
            onPress={() =>
              navigation.navigate('OpportunityDetail', {
                opportunityId: item.id,
              })
            }
          />
        )}
      />
    </View>
  );
};

export const FeedScreen = HomeScreen;

const createStyles = (colors: ColorPalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[3],
      paddingBottom: spacing[1],
    },
    sectionWrapper: {
      marginBottom: spacing[2],
    },
    horizontalList: {
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[2],
    },
    eventsContainer: {
      paddingHorizontal: spacing[4],
      gap: spacing[2],
    },
    eventCard: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      padding: spacing[3],
    },
    eventBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    eventDateText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    eventTitle: {
      ...typography.cardTitle,
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    eventSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    eventTimeText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    listContainerTopBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    aiBanner: {
      marginHorizontal: spacing[4],
      marginTop: spacing[3],
      marginBottom: spacing[1],
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing[3],
    },
    aiBannerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[2],
    },
    aiIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiBannerTitle: {
      ...typography.cardTitle,
      fontSize: 14,
      color: colors.text,
    },
    aiBannerSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
    },
    aiBannerButtons: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    aiPrimaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      borderRadius: radii.sm,
      paddingVertical: 7,
    },
    aiPrimaryBtnText: {
      ...typography.label,
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    aiSecondaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.primarySoft,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.primary : '#BFDBFE',
      paddingVertical: 7,
    },
    aiSecondaryBtnText: {
      ...typography.label,
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    feedContainer: {
      paddingHorizontal: spacing[4],
      gap: spacing[2],
    },
    postCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      padding: spacing[3],
      marginBottom: spacing[2],
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      marginBottom: spacing[2],
    },
    avatarTouchable: {
      borderRadius: radii.full,
    },
    postAuthorInfo: {
      flex: 1,
    },
    postAuthorName: {
      ...typography.label,
      fontSize: 14,
      color: colors.text,
      fontWeight: '700',
    },
    postTimestamp: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 1,
    },
    postContentText: {
      ...typography.bodySmall,
      color: colors.text,
      lineHeight: 18,
      marginBottom: spacing[2],
    },
    postFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    postStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    postStatText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
    },
  });
