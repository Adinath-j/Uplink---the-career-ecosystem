import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { SearchField } from '../../components/common/SearchField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { typography, spacing, radii, useThemedStyles, ColorPalette } from '../../theme';
import { contentService, PostResponseDto } from '../../services/contentService';
import { useAuthStore } from '../../store/authStore';
import { useMessagingStore } from '../../store/messagingStore';
import { messagingService, UserSearchResult } from '../../services/messagingService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface ConnectionCandidate {
  id: string; // User UUID
  fullName: string;
  email?: string;
  headline?: string;
  avatarUrl?: string;
  recentTopic?: string;
  postCount: number;
}

export const NetworkScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { styles, colors } = useThemedStyles(createStyles);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const {
    getOrCreateConversation,
    searchPeers,
    conversations,
    fetchConversations,
    initSocket,
  } = useMessagingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<ConnectionCandidate[]>([]);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCommunityConnections = useCallback(
    async (query = '') => {
      try {
        const [feedRes, peerResults] = await Promise.all([
          contentService
            .getFeed('All', 0, 50)
            .catch(() => ({ success: false, data: [] as PostResponseDto[] })),
          searchPeers(query).catch(() => [] as UserSearchResult[]),
        ]);

        const authorsMap = new Map<string, ConnectionCandidate>();

        // 1. Populate all users from campus directory (Supabase users)
        if (Array.isArray(peerResults)) {
          peerResults.forEach((peer) => {
            if (currentUserId && peer.id?.toLowerCase() === currentUserId.toLowerCase()) return;
            authorsMap.set(peer.id, {
              id: peer.id,
              fullName: peer.fullName || 'Campus Peer',
              email: peer.email,
              headline: peer.role ? `${peer.role} • Campus Community` : 'Campus Peer',
              avatarUrl: peer.avatarUrl,
              postCount: 0,
            });
          });
        }

        // 2. Overlay feed activity & post topics
        if (feedRes.success && feedRes.data) {
          feedRes.data.forEach((item: PostResponseDto) => {
            const user = item.post?.user;
            if (!user || !user.id || (currentUserId && user.id.toLowerCase() === currentUserId.toLowerCase())) return;

            const firstSnippet = item.post.content
              ? item.post.content.trim().slice(0, 70)
              : undefined;

            const existing = authorsMap.get(user.id);
            if (existing) {
              existing.postCount += 1;
              if (!existing.recentTopic && firstSnippet) {
                existing.recentTopic = `"${firstSnippet}..."`;
              }
            } else {
              const q = query.toLowerCase().trim();
              const matches =
                !q ||
                user.fullName?.toLowerCase().includes(q) ||
                user.email?.toLowerCase().includes(q) ||
                item.post.content?.toLowerCase().includes(q);

              if (matches) {
                authorsMap.set(user.id, {
                  id: user.id,
                  fullName: user.fullName || 'Campus Member',
                  email: user.email,
                  headline: item.post.type ? `${item.post.type} Contributor` : 'Campus Peer',
                  recentTopic: firstSnippet ? `"${firstSnippet}..."` : undefined,
                  postCount: 1,
                });
              }
            }
          });
        }

        const newCandidates = Array.from(authorsMap.values());
        setConnections((prev) => {
          if (!query.trim()) {
            return newCandidates;
          }
          const map = new Map<string, ConnectionCandidate>();
          prev.forEach((item) => map.set(item.id, item));
          newCandidates.forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        });
      } catch {
        // preserve existing connections on failure
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId, searchPeers]
  );

  useFocusEffect(
    useCallback(() => {
      initSocket();
      fetchConversations();
      fetchCommunityConnections(searchQuery);
    }, [fetchConversations, fetchCommunityConnections, initSocket, searchQuery])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchConversations(),
      fetchCommunityConnections(searchQuery),
    ]);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      fetchCommunityConnections(text);
    }, 250);
  };

  const handleStartChat = async (candidate: ConnectionCandidate) => {
    if (connectingUserId) return;
    setConnectingUserId(candidate.id);

    try {
      const conversation = await getOrCreateConversation(candidate.id);
      if (conversation?.id) {
        navigation.navigate('Chat', {
          conversationId: conversation.id,
          title: candidate.fullName,
        });
      } else {
        Alert.alert(
          'Message Error',
          'Unable to initiate conversation at this moment. Please verify your connection.'
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Message Error',
        err?.message || 'Failed to start conversation. Please try again.'
      );
    } finally {
      setConnectingUserId(null);
    }
  };

  const handleViewProfile = (candidate: ConnectionCandidate) => {
    navigation.navigate('PublicProfile', {
      userId: candidate.id,
      fullName: candidate.fullName,
    });
  };

  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const q = searchQuery.toLowerCase().trim();
    const collapsed = q.replace(/(.)\1+/g, '$1'); // "abhii" -> "abhi"
    const prefix = q.slice(0, 3);

    return connections.filter((c) => {
      const name = (c.fullName || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const headline = (c.headline || '').toLowerCase();
      const topic = (c.recentTopic || '').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        headline.includes(q) ||
        topic.includes(q) ||
        name.includes(collapsed) ||
        email.includes(collapsed) ||
        (q.length >= 3 && (name.includes(prefix) || email.includes(prefix)))
      );
    });
  }, [connections, searchQuery]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Messages"
        rightAction={
          <TouchableOpacity
            style={styles.headerInboxBtn}
            onPress={() => navigation.navigate('Conversations')}
            accessibilityRole="button"
            accessibilityLabel="View All Chats"
          >
            <Icon name="message-square" size={20} color={colors.primary} />
            {conversations.some((c) => (c.unreadCount || 0) > 0) && (
              <View style={styles.headerUnreadDot} />
            )}
          </TouchableOpacity>
        }
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      {/* Active Chats Shortcut Banner */}
      {conversations.length > 0 && !searchQuery.trim() && (
        <TouchableOpacity
          style={styles.conversationsBanner}
          onPress={() => navigation.navigate('Conversations')}
          activeOpacity={0.7}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIconWrap}>
              <Icon name="message-square" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Inbox & Active Threads</Text>
              <Text style={styles.bannerSubtitle}>
                {conversations.length} conversation{conversations.length === 1 ? '' : 's'} • Tap to view inbox
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      <View style={styles.searchWrapper}>
        <SearchField
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search peers, mentors, topics..."
          onClear={() => handleSearchChange('')}
        />
      </View>

      {isLoading && !isRefreshing ? (
        <LoadingState message="Discovering campus network..." />
      ) : filteredConnections.length === 0 ? (
        <EmptyState
          title="No Connections Found"
          description={
            searchQuery
              ? `No members match "${searchQuery}". Try a different name, email, or role.`
              : 'Active campus peers and contributors will appear here automatically.'
          }
          icon="users"
          actionLabel={searchQuery ? 'Clear Search' : 'Refresh Feed'}
          onActionPress={searchQuery ? () => handleSearchChange('') : onRefresh}
        />
      ) : (
        <FlatList
          data={filteredConnections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.headerTitleRow}>
                <Icon name="globe" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  {searchQuery.trim()
                    ? `Search Results (${filteredConnections.length})`
                    : `Campus Members & Mentors (${filteredConnections.length})`}
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Connect and start direct messages with peers, mentors, and recruiters
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isConnecting = connectingUserId === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardMain}>
                  <TouchableOpacity
                    onPress={() => handleViewProfile(item)}
                    activeOpacity={0.7}
                  >
                    <Avatar
                      name={item.fullName}
                      imageUrl={item.avatarUrl}
                      size={50}
                    />
                  </TouchableOpacity>

                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <TouchableOpacity
                        onPress={() => handleViewProfile(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.nameText}>{item.fullName}</Text>
                      </TouchableOpacity>
                      {item.postCount > 0 ? (
                        <StatusBadge
                          label={`${item.postCount} ${item.postCount === 1 ? 'post' : 'posts'}`}
                          variant="primary"
                        />
                      ) : null}
                    </View>

                    <Text style={styles.headlineText}>{item.headline}</Text>

                    {item.email ? (
                      <Text style={styles.emailText}>{item.email}</Text>
                    ) : null}

                    {item.recentTopic && (
                      <Text style={styles.topicText} numberOfLines={2}>
                        {item.recentTopic}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action Buttons: View Profile & Message */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => handleViewProfile(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.profileBtnText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.messageBtn,
                      isConnecting && styles.messageBtnDisabled,
                    ]}
                    onPress={() => handleStartChat(item)}
                    disabled={isConnecting}
                    activeOpacity={0.8}
                  >
                    {isConnecting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="send" size={14} color="#FFFFFF" />
                        <Text style={styles.messageBtnText}>Message</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ColorPalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerInboxBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    headerUnreadDot: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.danger || '#EF4444',
    },
    conversationsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primarySoft,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      marginHorizontal: spacing[4],
      marginTop: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    bannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bannerIconWrap: {
      width: 40,
      height: 40,
      borderRadius: radii.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerTitle: {
      ...typography.cardTitle,
      fontSize: 15,
      color: colors.primary,
      fontWeight: '700',
    },
    bannerSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    emailText: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 2,
    },
    searchWrapper: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listContent: {
      padding: spacing[4],
      paddingBottom: spacing[8],
    },
    listHeader: {
      marginBottom: spacing[3],
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    sectionTitle: {
      ...typography.h3,
      fontSize: 16,
      color: colors.text,
    },
    sectionSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[3],
      padding: spacing[3],
    },
    cardMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[3],
    },
    cardInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    nameText: {
      ...typography.cardTitle,
      fontSize: 15,
      color: colors.text,
      fontWeight: '700',
    },
    headlineText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    topicText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      marginTop: spacing[3],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    profileBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileBtnText: {
      ...typography.label,
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
    },
    messageBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: radii.sm,
      backgroundColor: colors.primary,
    },
    messageBtnDisabled: {
      opacity: 0.7,
    },
    messageBtnText: {
      ...typography.label,
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
