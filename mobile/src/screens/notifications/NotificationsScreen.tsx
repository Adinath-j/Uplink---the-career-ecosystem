import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { InAppNotification } from '../../types/models';
import { colors, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';
import { notificationService } from '../../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    };

    loadNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        onBackPress={() => navigation.goBack()}
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No New Notifications"
          description="Updates on your applications, mentorship sessions, and Q&A replies will appear here."
          icon="bell"
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleMarkAsRead(item.id)}
              activeOpacity={0.7}
              style={[styles.item, !item.isRead && styles.itemUnread]}
            >
              <View style={styles.iconCircle}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  item: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemUnread: {
    backgroundColor: colors.surfaceMuted,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemTitleUnread: {
    color: colors.text,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  itemMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
