import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { useAuthStore } from '../../store/authStore';
import { usePreferencesStore } from '../../store/preferencesStore';

interface AppHeaderProps {
  title?: string;
  onBookmarkPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBookmarkPress,
  onNotificationPress,
  onProfilePress,
  onBackPress,
  rightAction,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { bookmarkedOpportunityIds } = usePreferencesStore();
  const hasBookmarks = bookmarkedOpportunityIds.length > 0;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: Math.max(insets.top, spacing[2]) },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.leftSection}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={22} color={colors.text} />
            </TouchableOpacity>
          )}

          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            // Spacer if no title (e.g. Feed screen top toolbar)
            <View style={styles.emptyTitle} />
          )}
        </View>

        <View style={styles.rightSection}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {onBookmarkPress && (
                <TouchableOpacity
                  onPress={onBookmarkPress}
                  accessibilityRole="button"
                  accessibilityLabel="Saved opportunities"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.actionBtn}
                >
                  <Icon
                    name={hasBookmarks ? 'bookmark-fill' : 'bookmark'}
                    size={20}
                    color={hasBookmarks ? colors.primary : colors.text}
                  />
                </TouchableOpacity>
              )}

              {onNotificationPress && (
                <TouchableOpacity
                  onPress={onNotificationPress}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.actionBtn}
                >
                  <Icon name="bell-dot" size={20} color={colors.text} />
                </TouchableOpacity>
              )}

              {onProfilePress && (
                <TouchableOpacity
                  onPress={onProfilePress}
                  accessibilityRole="button"
                  accessibilityLabel="My Profile"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.avatarBtn}
                >
                  <Avatar
                    name={user?.fullName || 'Aditya Verma'}
                    imageUrl={user?.avatarUrl}
                    size={32}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: spacing[3],
    paddingVertical: spacing[1],
  },
  title: {
    ...typography.screenTitle,
    color: colors.text,
  },
  emptyTitle: {
    width: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    marginLeft: spacing[1],
    padding: 2,
  },
});
