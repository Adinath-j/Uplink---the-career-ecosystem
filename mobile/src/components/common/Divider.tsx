import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  style?: ViewStyle;
  spacingVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  spacingVertical = spacing[2],
}) => {
  return (
    <View
      style={[
        styles.divider,
        { marginVertical: spacingVertical },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
});
