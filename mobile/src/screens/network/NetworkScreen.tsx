import React, { useEffect, useState, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { SearchField } from '../../components/common/SearchField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { colors, typography, spacing, radii } from '../../theme';
import { contentService, PostResponseDto } from '../../services/contentService';
import { useAuthStore } from '../../store/authStore';
import { useMessagingStore } from '../../store/messagingStore';

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
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { createConversation } = useMessagingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<ConnectionCandidate[]>([]);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);

  const fetchCommunityConnections = async () => {
    try {
      const res = await contentService.getFeed('All', 0, 50);
      if (res.success && res.data) {
        // Group and extract unique authors from community feed
        const authorsMap = new Map<string, ConnectionCandidate>();

        res.data.forEach((item: PostResponseDto) => {
          const user = item.post?.user;
          if (!user || !user.id) return;

          // Exclude currently logged in student
          if (currentUserId && user.id === currentUserId) return;

          const existing = authorsMap.get(user.id);
          if (existing) {
            existing.postCount += 1;
          } else {
            const firstSnippet = item.post.content
              ? item.post.content.trim().slice(0, 70)
              : undefined;

            authorsMap.set(user.id, {
              id: user.id,
              fullName: user.fullName || 'Campus Member',
              email: user.email,
              headline: item.post.type ? `${item.post.type} Contributor` : 'Campus Peer',
              recentTopic: firstSnippet ? `"${firstSnippet}..."` : undefined,
              postCount: 1,
            });
          }
        });

        setConnections(Array.from(authorsMap.values()));
      } else {
        setConnections([]);
      }
    } catch {
      setConnections([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommunityConnections();
  }, [currentUserId]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchCommunityConnections();
  };

  // Filter connections by search query
  const filteredConnections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return connections;
    return connections.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.headline && c.headline.toLowerCase().includes(q)) ||
        (c.recentTopic && c.recentTopic.toLowerCase().includes(q))
    );
  }, [connections, searchQuery]);

  // Handle direct message initiation
  const handleStartMessage = async (candidate: ConnectionCandidate) => {
    if (connectingUserId) return;
    setConnectingUserId(candidate.id);

    try {
      const convo = await createConversation([candidate.id]);
      if (convo && convo.id) {
        navigation.navigate('Chat', {
          conversationId: convo.id,
          title: candidate.fullName,
        });
      } else {
        Alert.alert(
          'Unable to Connect',
          'Could not initiate chat with this user on the server.'
        );
      }
    } catch {
      Alert.alert(
        'Unable to Connect',
        'Could not initiate chat with this user right now. Please try again.'
      );
    } finally {
      setConnectingUserId(null);
    }
  };

  const renderConnectionItem = ({ item }: { item: ConnectionCandidate }) => {
    const isConnecting = connectingUserId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('PublicProfile', {
              userId: item.id,
              fullName: item.fullName,
            })
          }
        >
          <Avatar
            name={item.fullName}
            imageUrl={item.avatarUrl}
            size={52}
          />
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{item.fullName}</Text>
              <StatusBadge label="PEER" variant="neutral" />
            </View>
            <Text style={styles.headlineText} numberOfLines={1}>
              {item.headline || 'Active Community Member'}
            </Text>
            {item.recentTopic && (
              <Text style={styles.topicText} numberOfLines={2}>
                💬 {item.recentTopic}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Row */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() =>
              navigation.navigate('PublicProfile', {
                userId: item.id,
                fullName: item.fullName,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.profileBtnText}>View Portfolio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.messageBtn, isConnecting && styles.messageBtnDisabled]}
            onPress={() => handleStartMessage(item)}
            disabled={isConnecting}
            activeOpacity={0.7}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="message-square" size={14} color="#FFFFFF" />
                <Text style={styles.messageBtnText}>Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Network & Community"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onMessagePress={() => navigation.navigate('Conversations')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      <View style={styles.searchWrapper}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search peers by name, skill, or discussion..."
        />
      </View>

      {isLoading ? (
        <LoadingState message="Discovering campus peers & creators..." />
      ) : filteredConnections.length === 0 ? (
        <EmptyState
          title="No Connections Found"
          description="Try adjusting your search terms or check back as more students join discussions."
          icon="users"
          actionLabel="Clear Search"
          onActionPress={() => setSearchQuery('')}
        />
      ) : (
        <FlatList
          data={filteredConnections}
          keyExtractor={(item) => item.id}
          renderItem={renderConnectionItem}
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
                  Suggested Connections ({filteredConnections.length})
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Connect with active peers, project creators, and campus mentors
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderTopColor: '#F3F4F6',
  },
  profileBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
