import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Mentor } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { Avatar } from '../common/Avatar';
import { PrimaryButton } from '../common/PrimaryButton';

interface MentorListItemProps {
  mentor: Mentor;
  onPress: () => void;
  onBookPress: () => void;
  style?: ViewStyle;
}

export const MentorListItem: React.FC<MentorListItemProps> = ({
  mentor,
  onPress,
  onBookPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Mentor: ${mentor.name}, ${mentor.designation} at ${mentor.organization}`}
      style={[styles.container, style]}
    >
      <View style={styles.contentRow}>
        <Avatar name={mentor.name} imageUrl={mentor.avatar} size={48} />

        <View style={styles.infoCol}>
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.role} numberOfLines={1}>
            {mentor.designation}
          </Text>
          <Text style={styles.org} numberOfLines={1}>
            {mentor.organization} • {mentor.yearsOfExperience} yrs exp
          </Text>

          <View style={styles.skillsRow}>
            {mentor.skills.slice(0, 3).map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionCol}>
          <PrimaryButton
            label="Book"
            size="sm"
            onPress={onBookPress}
            disabled={!mentor.isAvailable}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing[3],
    marginRight: spacing[2],
  },
  name: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 2,
  },
  role: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  org: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  skillText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionCol: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
