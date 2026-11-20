import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlertStore } from '../../store/alertStore';
import { radii, spacing, typography, useTheme } from '../../theme';
import { Icon } from './Icon';

interface InAppNotificationBannerProps {
  onNavigateToChat?: (conversationId: string, title?: string) => void;
  onNavigateToNotifications?: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  onNavigateToChat,
  onNavigateToNotifications,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { activeAlert, dismissAlert } = useAlertStore();

  if (!activeAlert) {
    return null;
  }

  const handlePress = () => {
    const alert = activeAlert;
    dismissAlert();

    if (alert.type === 'MESSAGE' && alert.data?.conversationId) {
      if (onNavigateToChat) {
        onNavigateToChat(alert.data.conversationId, alert.data.senderName || alert.title);
      }
    } else if (alert.type === 'NOTIFICATION') {
      if (onNavigateToNotifications) {
        onNavigateToNotifications();
      }
    }
  };

  const isMessage = activeAlert.type === 'MESSAGE';

  return (
    <View
      style={[
        styles.overlayContainer,
        { top: Math.max(insets.top, Platform.OS === 'android' ? 10 : 20) },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.bannerCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: isDark ? '#000000' : '#0F172A',
          },
        ]}
        activeOpacity={0.92}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${activeAlert.title}: ${activeAlert.subtitle}`}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isMessage
                ? colors.primarySoft
                : colors.warningSoft,
            },
          ]}
        >
          <Icon
            name={isMessage ? 'message-square' : 'bell'}
            size={18}
            color={isMessage ? colors.primary : colors.warning}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {activeAlert.title}
            </Text>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {isMessage ? 'Direct Message' : 'Notification'}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {activeAlert.subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissAlert}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
        >
          <Icon name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
    elevation: 10,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
    marginRight: spacing[2],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 14,
    flex: 1,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: spacing[2],
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    padding: spacing[1],
    marginLeft: spacing[1],
  },
});
