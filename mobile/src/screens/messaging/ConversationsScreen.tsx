import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useMessagingStore } from '../../store/messagingStore';
import { useAuthStore } from '../../store/authStore';
import { BackendConversation } from '../../services/messagingService';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversations'>;

export const ConversationsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    conversations,
    isLoadingConversations,
    error,
    fetchConversations,
  } = useMessagingStore();

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

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
    const dateStr = item.updatedAt || item.createdAt;
    let formattedDate = '';
    if (dateStr) {
      try {
        formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      } catch {
        formattedDate = '';
      }
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.id,
            title,
          })
        }
      >
        <Avatar name={title} size={46} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            {formattedDate ? (
              <Text style={styles.cardTime}>{formattedDate}</Text>
            ) : null}
          </View>
          <Text style={styles.cardPreview} numberOfLines={1}>
            {item.type === 'GROUP' ? 'Group Discussion' : 'Direct Conversation'} • Tap to chat
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Messages"
        onBackPress={() => navigation.goBack()}
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
          actionLabel="Refresh Messages"
          onActionPress={fetchConversations}
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
  cardTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardPreview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
