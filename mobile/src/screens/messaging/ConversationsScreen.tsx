import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { Icon } from '../../components/common/Icon';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useMessagingStore } from '../../store/messagingStore';
import { useAuthStore } from '../../store/authStore';
import { BackendConversation, UserSearchResult } from '../../services/messagingService';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversations'>;

export const ConversationsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    conversations,
    isLoadingConversations,
    error,
    fetchConversations,
    getOrCreateConversation,
    searchPeers,
    initSocket,
  } = useMessagingStore();

  const currentUser = useAuthStore((state) => state.user);

  // New Chat modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    initSocket();
    fetchConversations();
  }, [fetchConversations, initSocket]);

  const onRefresh = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  const handleSearchTextChange = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPeers(text.trim());
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPeer = async (peer: UserSearchResult) => {
    if (isStartingChat) return;
    setIsStartingChat(true);
    try {
      const convo = await getOrCreateConversation(peer.id);
      if (convo) {
        setIsModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        navigation.navigate('Chat', {
          conversationId: convo.id,
          title: peer.fullName,
        });
      }
    } finally {
      setIsStartingChat(false);
    }
  };

  const getConversationTitle = (conv: BackendConversation): string => {
    const otherMembers = (conv.members || []).filter(
      (m) => m.user?.id !== currentUser?.id
    );
    if (otherMembers.length > 0) {
      return otherMembers.map((m) => m.user?.fullName || 'Campus Peer').join(', ');
    }
    return 'Campus Discussion';
  };

  const renderItem = ({ item }: { item: BackendConversation }) => {
    const title = getConversationTitle(item);
    const dateStr = item.lastMessage?.createdAt || item.updatedAt || item.createdAt;
    let formattedDate = '';
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          formattedDate = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
      } catch {
        formattedDate = '';
      }
    }

    const preview = item.lastMessage?.content
      ? item.lastMessage.content
      : item.type === 'GROUP'
      ? 'Group Discussion'
      : 'Direct Conversation • Tap to chat';

    const hasUnread = (item.unreadCount || 0) > 0;

    return (
      <TouchableOpacity
        style={[styles.card, hasUnread && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.id,
            title,
          })
        }
      >
        <Avatar name={title} size={48} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, hasUnread && styles.boldTitle]} numberOfLines={1}>
              {title}
            </Text>
            {formattedDate ? (
              <Text style={[styles.cardTime, hasUnread && styles.unreadTime]}>{formattedDate}</Text>
            ) : null}
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.cardPreview, hasUnread && styles.unreadPreview]} numberOfLines={1}>
              {preview}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Messages"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => setIsModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="New Chat"
          >
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.newChatBtnText}>New Chat</Text>
          </TouchableOpacity>
        }
      />

      {isLoadingConversations && conversations.length === 0 ? (
        <LoadingState message="Loading conversations..." />
      ) : error && conversations.length === 0 ? (
        <ErrorState message={error} onRetry={fetchConversations} />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No Conversations Yet"
          description="Connect with mentors, recruiters, and peers to start direct messaging."
          icon="message-square"
          actionLabel="Start a Chat"
          onActionPress={() => setIsModalOpen(true)}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingConversations}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* New Chat / Peer Search Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Icon name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search peers by name or email..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchTextChange}
                autoFocus
              />
              {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>

            {isStartingChat ? (
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Opening conversation...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.searchResultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.peerResultItem}
                    onPress={() => handleSelectPeer(item)}
                  >
                    <Avatar name={item.fullName} size={40} />
                    <View style={styles.peerInfo}>
                      <Text style={styles.peerName}>{item.fullName}</Text>
                      <Text style={styles.peerEmail}>{item.email}</Text>
                    </View>
                    <Icon name="message-square" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            ) : searchQuery.trim().length > 0 && !isSearching ? (
              <View style={styles.emptySearch}>
                <Text style={styles.emptySearchText}>No campus peers found matching "{searchQuery}"</Text>
              </View>
            ) : (
              <View style={styles.emptySearch}>
                <Text style={styles.emptySearchHint}>
                  Type a name or email address to find peers and start chatting.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  unreadCard: {
    borderColor: '#93C5FD',
    backgroundColor: '#F0F7FF',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.cardTitle,
    fontSize: 15,
    color: colors.text,
    flex: 1,
    marginRight: spacing[2],
  },
  boldTitle: {
    fontWeight: '700',
    color: colors.primary,
  },
  cardTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  unreadTime: {
    color: colors.primary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPreview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  unreadPreview: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 4,
  },
  newChatBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    maxHeight: '80%',
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  modalTitle: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    gap: 8,
    marginBottom: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  searchResultsList: {
    paddingVertical: spacing[1],
  },
  peerResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  peerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  peerName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    fontSize: 15,
  },
  peerEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptySearch: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySearchHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingCenter: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
