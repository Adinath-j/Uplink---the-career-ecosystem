import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { colors, typography, spacing, radii } from '../../theme';
import { useVerificationStore } from '../../store/verificationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DOCUMENT_TYPES = [
  { id: 'COLLEGE_ID', label: 'College / Student ID', icon: 'academic-cap', desc: 'Valid university identity card with enrollment number' },
  { id: 'IDENTITY_PROOF', label: 'Government Photo ID', icon: 'shield-check', desc: 'Passport, National Identity Card, or Driving License' },
  { id: 'COMPANY_DOC', label: 'Offer / Internship Letter', icon: 'briefcase', desc: 'Official employer appointment or internship certificate' },
];

export const VerificationUploadScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    verifications,
    isLoading,
    isSubmitting,
    fetchMyVerifications,
    submitVerification,
  } = useVerificationStore();

  const [selectedType, setSelectedType] = useState('COLLEGE_ID');
  const [documentUrl, setDocumentUrl] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchMyVerifications();
  }, [fetchMyVerifications]);

  const hasApproved = verifications.some((v) => v.status === 'APPROVED');
  const hasPending = verifications.some((v) => v.status === 'PENDING');

  const handleSubmit = async () => {
    if (!documentUrl.trim()) {
      Alert.alert('Document Required', 'Please provide a valid document URL or image link.');
      return;
    }

    const success = await submitVerification({
      type: selectedType,
      documentUrl: documentUrl.trim(),
      remarks: remarks.trim() || undefined,
    });

    if (success) {
      setDocumentUrl('');
      setRemarks('');
      Alert.alert(
        'Submission Received',
        'Your verification documents have been submitted for institutional review.'
      );
    }
  };

  const handleUseSampleUrl = () => {
    setDocumentUrl('https://uplink-kzh3.onrender.com/static/samples/student_id_proof.pdf');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Institutional Verification"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMyVerifications}
            tintColor={colors.primary}
          />
        }
      >
        {/* Verification Status Banner */}
        {hasApproved ? (
          <View style={[styles.statusHero, styles.statusHeroApproved]}>
            <Icon name="check-circle" size={24} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusHeroTitle}>Verified Institutional Profile</Text>
              <Text style={styles.statusHeroSubtitle}>
                Your credentials have been officially verified by campus administration.
              </Text>
            </View>
          </View>
        ) : hasPending ? (
          <View style={[styles.statusHero, styles.statusHeroPending]}>
            <Icon name="clock" size={24} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusHeroTitle}>Verification in Review</Text>
              <Text style={styles.statusHeroSubtitle}>
                Your documents are undergoing administrative review. Normal turnaround is 24-48 hours.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.statusHero, styles.statusHeroNeutral]}>
            <Icon name="shield-check" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusHeroTitle}>Get Campus Verified</Text>
              <Text style={styles.statusHeroSubtitle}>
                Earn the Verified Badge to stand out to employers and unlock premium opportunities.
              </Text>
            </View>
          </View>
        )}

        {/* Form Section */}
        <Text style={styles.sectionTitle}>1. Select Document Type</Text>
        <View style={styles.typeSelector}>
          {DOCUMENT_TYPES.map((doc) => {
            const isSelected = selectedType === doc.id;
            return (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(doc.id)}
                activeOpacity={0.7}
              >
                <View style={styles.typeCardHeader}>
                  <Text
                    style={[
                      styles.typeCardLabel,
                      isSelected && styles.typeCardLabelSelected,
                    ]}
                  >
                    {doc.label}
                  </Text>
                  {isSelected ? (
                    <Icon name="check" size={16} color={colors.primary} />
                  ) : null}
                </View>
                <Text style={styles.typeCardDesc}>{doc.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing[4] }]}>
          2. Document Link & Remarks
        </Text>
        <View style={styles.formCard}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Document Link / Image URL</Text>
            <TouchableOpacity onPress={handleUseSampleUrl} activeOpacity={0.7}>
              <Text style={styles.sampleLinkText}>Insert Sample URL</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={documentUrl}
            onChangeText={setDocumentUrl}
            placeholder="https://drive.google.com/... or cloud storage URL"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />

          <Text style={[styles.inputLabel, { marginTop: spacing[3] }]}>
            Additional Notes for Reviewer (Optional)
          </Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g., Enrollment ID: CS-2024-042, Student Council member"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <PrimaryButton
          label={isSubmitting ? 'Uploading & Submitting...' : 'Submit Verification Request'}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: spacing[4] }}
        />

        {/* Verification History */}
        <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]}>
          Submission History
        </Text>

        {isLoading && verifications.length === 0 ? (
          <LoadingState message="Loading verification records..." />
        ) : verifications.length === 0 ? (
          <View style={styles.emptyHistoryCard}>
            <Icon name="file-text" size={32} color={colors.textSecondary} />
            <Text style={styles.emptyHistoryTitle}>No Submissions Yet</Text>
            <Text style={styles.emptyHistoryDesc}>
              Upload a document above to begin your institutional verification process.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {verifications.map((item) => {
              const statusVariant =
                item.status === 'APPROVED'
                  ? 'success'
                  : item.status === 'REJECTED'
                  ? 'danger'
                  : 'warning';

              return (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTypeBadge}>
                      <Icon name="shield-check" size={14} color={colors.primary} />
                      <Text style={styles.historyTypeText}>
                        {item.type.replace('_', ' ')}
                      </Text>
                    </View>
                    <StatusBadge label={item.status} variant={statusVariant} />
                  </View>

                  <Text
                    style={styles.historyUrlText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    📄 {item.documentUrl}
                  </Text>

                  {item.remarks && (
                    <Text style={styles.historyRemarksText}>
                      Note: {item.remarks}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing[4],
  },
  statusHeroApproved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusHeroPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusHeroNeutral: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statusHeroTitle: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statusHeroSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing[2],
  },
  typeSelector: {
    gap: spacing[2],
  },
  typeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8FAFC',
  },
  typeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeCardLabel: {
    ...typography.label,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  typeCardLabelSelected: {
    color: colors.primary,
  },
  typeCardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  inputLabel: {
    ...typography.label,
    fontSize: 13,
    color: colors.text,
  },
  sampleLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.text,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyHistoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyHistoryTitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.text,
    marginTop: spacing[2],
  },
  emptyHistoryDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  historyList: {
    gap: spacing[2],
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  historyTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTypeText: {
    ...typography.label,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  historyUrlText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyRemarksText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
