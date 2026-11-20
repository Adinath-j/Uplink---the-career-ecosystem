import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { spacing, typography } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { Icon } from '../common/Icon';

interface ProfileSectionProps {
  title: string;
  icon?: any;
  onActionPress?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  onActionPress,
  actionLabel,
  children,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onActionPress && (
          <TouchableOpacity
            onPress={onActionPress}
            activeOpacity={0.7}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={actionLabel || 'Edit section'}
          >
            <Text style={styles.actionText}>{actionLabel || 'Edit'}</Text>
            <Icon name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[2],
    },
    title: {
      ...typography.sectionTitle,
      fontSize: 15,
      color: colors.textPrimary,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 2,
    },
    actionText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    body: {
      marginTop: spacing[1],
    },
  });
