import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, useTheme } from '../../theme';

interface DividerProps {
  style?: ViewStyle;
  spacingVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  spacingVertical = spacing[2],
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border,
          marginVertical: spacingVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
