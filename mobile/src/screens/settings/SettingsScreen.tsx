import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { Icon } from '../../components/common/Icon';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { authService } from '../../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const { profile } = useProfileStore();

  // Notification Toggles (persisted locally)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [qaAlerts, setQaAlerts] = useState(true);
  const [mentorAlerts, setMentorAlerts] = useState(true);

  // Password reset modal state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || profile?.email || '');
  const [isSendingReset, setIsSendingReset] = useState(false);

  // About / Terms modal state
  const [legalModalTitle, setLegalModalTitle] = useState<string | null>(null);
  const [legalModalContent, setLegalModalContent] = useState<string>('');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of UPLINK?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.replace('SignIn');
        },
      },
    ]);
  };


  const handleSendPasswordReset = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Validation Error', 'Please enter your registered email address.');
      return;
    }

    setIsSendingReset(true);
    try {
      const res = await authService.forgotPassword(resetEmail.trim());
      setIsSendingReset(false);
      setIsPasswordModalVisible(false);
      if (res.success) {
        Alert.alert(
          'Reset Link Dispatched',
          `Password reset instructions have been sent to ${resetEmail.trim()}. Please check your inbox.`
        );
      } else {
        Alert.alert(
          'Password Reset',
          res.message || 'If an account matches that email, instructions have been sent.'
        );
      }
    } catch {
      setIsSendingReset(false);
      setIsPasswordModalVisible(false);
      Alert.alert(
        'Password Reset',
        'If an account matches that email, instructions have been sent.'
      );
    }
  };

  const openLegalModal = (title: string, content: string) => {
    setLegalModalTitle(title);
    setLegalModalContent(content);
  };

  const displayName = profile?.fullName || user?.fullName || 'Campus Member';
  const displayEmail = profile?.email || user?.email || 'student@campus.edu';
  const isVerified = Boolean(profile?.isVerified || (user as any)?.isVerified);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Settings"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Header Card */}
        <View style={styles.accountCard}>
          <Avatar name={displayName} imageUrl={profile?.avatarUrl} size={58} />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{displayName}</Text>
            <Text style={styles.accountEmail}>{displayEmail}</Text>
            <View style={styles.badgeRow}>
              {isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={13} color="#059669" />
                  <Text style={styles.verifiedText}>Verified Student</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.unverifiedBadge}
                  onPress={() => navigation.navigate('VerificationUpload')}
                  activeOpacity={0.7}
                >
                  <Icon name="shield-check" size={13} color={colors.primary} />
                  <Text style={styles.unverifiedText}>Get Verified &rarr;</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Section 1: Account & Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account & Security</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Icon name="edit" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Edit Profile Info</Text>
              <Text style={styles.rowSubtitle}>Name, bio, department, and academic standing</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('VerificationUpload')}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Icon name="shield-check" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Institutional Verification</Text>
              <Text style={styles.rowSubtitle}>Upload student ID card or enrollment letter</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setIsPasswordModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Icon name="lock" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Change Password</Text>
              <Text style={styles.rowSubtitle}>Request secure password reset instructions</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 2: Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Notifications</Text>

          <View style={styles.switchRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Master switch for mobile device notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Opportunities & Internships</Text>
              <Text style={styles.rowSubtitle}>Alerts for verified campus jobs and deadlines</Text>
            </View>
            <Switch
              value={jobAlerts}
              onValueChange={setJobAlerts}
              disabled={!pushEnabled}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Peer Discussions & Q&A</Text>
              <Text style={styles.rowSubtitle}>Replies to questions and academic answers</Text>
            </View>
            <Switch
              value={qaAlerts}
              onValueChange={setQaAlerts}
              disabled={!pushEnabled}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Mentorship Updates</Text>
              <Text style={styles.rowSubtitle}>Booking confirmations and alumni messages</Text>
            </View>
            <Switch
              value={mentorAlerts}
              onValueChange={setMentorAlerts}
              disabled={!pushEnabled}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section 4: About & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About & Legal</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() =>
              openLegalModal(
                'Terms of Service',
                'UPLINK is a campus career and academic ecosystem connecting students, alumni mentors, and verified employers. Users agree to provide genuine academic credentials and adhere to institutional honor codes.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Terms of Service</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() =>
              openLegalModal(
                'Privacy Policy',
                'Your portfolio, contact details, and verification documents are encrypted. Only verified recruiters from partner institutions can view candidate resumes and portfolios.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.staticRow}>
            <Text style={styles.staticLabel}>Version</Text>
            <Text style={styles.staticValue}>1.0.0 (Build 2026.11)</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign out of Uplink"
          >
            <Icon name="close" size={18} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out of Uplink</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setIsPasswordModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter your registered email address. We will dispatch a secure link to reset your password.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="name@campus.edu"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActionRow}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setIsPasswordModalVisible(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isSendingReset ? 'Sending...' : 'Send Link'}
                onPress={handleSendPasswordReset}
                disabled={isSendingReset}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Legal Info Modal */}
      <Modal
        visible={Boolean(legalModalTitle)}
        transparent
        animationType="fade"
        onRequestClose={() => setLegalModalTitle(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{legalModalTitle}</Text>
              <TouchableOpacity
                onPress={() => setLegalModalTitle(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>{legalModalContent}</Text>

            <PrimaryButton
              label="Understood"
              onPress={() => setLegalModalTitle(null)}
              style={{ marginTop: spacing[4] }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing[8],
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing[3],
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...typography.cardTitle,
    fontSize: 17,
    color: colors.text,
  },
  accountEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  unverifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    marginTop: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[1],
  },
  sectionHeader: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  rowIcon: {
    marginRight: spacing[3],
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  staticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  staticLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  staticValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  signOutSection: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
  },
  modalDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing[4],
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
