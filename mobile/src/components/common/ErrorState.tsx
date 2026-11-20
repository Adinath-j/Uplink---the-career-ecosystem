import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radii, spacing, typography, useTheme } from '../../theme';
import { Icon } from './Icon';
import { SecondaryButton } from './SecondaryButton';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An error occurred while loading information.',
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.dangerSoft }]}>
        <Icon name="help-circle" size={30} color={colors.danger} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Unable to Load Data</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <SecondaryButton
          label="Try Again"
          onPress={onRetry}
          size="sm"
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  title: {
    ...typography.cardTitle,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  description: {
    ...typography.bodySmall,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: spacing[4],
  },
});
