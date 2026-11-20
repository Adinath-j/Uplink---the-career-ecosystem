import React, { useEffect, useState, useCallback } from 'react';
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
import { InAppNotification } from '../../types/models';
import { spacing, typography } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { AppHeader } from '../../components/common/AppHeader';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Icon, IconName } from '../../components/common/Icon';
import { notificationService } from '../../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const res = await notificationService.getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIconForType = (type: InAppNotification['type']): IconName => {
    switch (type) {
      case 'APPLICATION':
        return 'briefcase';
      case 'QA':
        return 'help-circle';
      case 'MENTORSHIP':
        return 'users';
      case 'ANNOUNCEMENT':
      default:
        return 'bell';
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        rightAction={
          hasUnread ? (
            <SecondaryButton
              label="Mark all read"
              size="sm"
              onPress={handleMarkAllAsRead}
            />
          ) : undefined
        }
      />

      {isLoading && !isRefreshing ? (
        <LoadingState message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No New Notifications"
          description="Updates on your applications, campus notices, and opportunities will appear here."
          icon="bell"
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleMarkAsRead(item.id)}
              activeOpacity={0.7}
              style={[styles.item, !item.isRead && styles.itemUnread]}
            >
              <View style={[styles.iconCircle, !item.isRead && styles.iconCircleUnread]}>
                <Icon
                  name={getIconForType(item.type)}
                  size={18}
                  color={item.isRead ? colors.textSecondary : colors.primary}
                />
              </View>

              <View style={styles.itemContent}>
                <View style={styles.itemTopRow}>
                  <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingVertical: spacing[2],
    },
    item: {
      flexDirection: 'row',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'flex-start',
    },
    itemUnread: {
      backgroundColor: colors.primarySoft,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    iconCircleUnread: {
      backgroundColor: colors.primarySoft,
    },
    itemContent: {
      flex: 1,
    },
    itemTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    itemTitle: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    },
    itemTitleUnread: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: spacing[2],
    },
    itemMessage: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
