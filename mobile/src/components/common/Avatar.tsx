import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 36,
}) => {
  const { colors } = useTheme();

  const getInitials = (text: string) => {
    if (!text) return 'U';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const fontSize = Math.round(size * 0.4);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceMuted,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar of ${name}`}
    >
      <Text style={[styles.initials, { fontSize, color: colors.primary }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  image: {},
});
