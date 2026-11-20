import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { Avatar } from '../../components/common/Avatar';
import { typography, spacing, radii } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { useAiStore } from '../../store/aiStore';
import { useProfileStore } from '../../store/profileStore';
import { resumeService, ResumeDto } from '../../services/resumeService';
import { ENV } from '../../config/env';
import { validateResumeTargetRole, validateAtsResumeText } from '../../utils/validation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RESUME_TEMPLATES = [
  { id: 'MODERN', name: 'Modern Tech', desc: 'Sleek 2-column layout favored by high-growth startups & scaleups.' },
  { id: 'CLASSIC', name: 'Classic Corporate', desc: 'Standard traditional serif format preferred by enterprise & banking.' },
  { id: 'ACADEMIC', name: 'Academic CV', desc: 'Comprehensive structure with focus on research, publications & education.' },
  { id: 'EXECUTIVE', name: 'Executive Leader', desc: 'High-impact layout emphasizing leadership metrics and outcomes.' },
];

export const ResumeBuilderScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();
  const {
    latestResume,
    isGeneratingResume,
    generateNewResume,
    atsResult,
    isEvaluatingAts,
    evaluateResumeAts,
  } = useAiStore();

  const { profile } = useProfileStore();

  const [activeTab, setActiveTab] = useState<'BUILDER' | 'ATS'>('BUILDER');

  // Generator state
  const [selectedTemplate, setSelectedTemplate] = useState('MODERN');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeCertifications, setIncludeCertifications] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);

  // My Resumes list & Ready Modal state
  const [myResumes, setMyResumes] = useState<ResumeDto[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [modalResume, setModalResume] = useState<ResumeDto | null>(null);
  const [isReadyModalVisible, setIsReadyModalVisible] = useState(false);
  const [showModalLatex, setShowModalLatex] = useState(false);

  // ATS state
  const [resumeText, setResumeText] = useState('');
  const [atsTargetRole, setAtsTargetRole] = useState('Software Engineer');
  const [showLatex, setShowLatex] = useState(false);
  const [builderErrors, setBuilderErrors] = useState<{ targetRole?: string }>({});
  const [atsErrors, setAtsErrors] = useState<{ atsTargetRole?: string; resumeText?: string }>({});

  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const list = await resumeService.getMyResumes();
      setMyResumes(list);
    } catch {
      // Keep empty if network fails
    } finally {
      setIsLoadingResumes(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleGenerate = async () => {
    const roleErr = validateResumeTargetRole(targetRole);
    if (roleErr) {
      setBuilderErrors({ targetRole: roleErr });
      return;
    }
    setBuilderErrors({});

    try {
      const res = await generateNewResume({
        template: selectedTemplate,
        targetRole: targetRole.trim(),
        includeProjects,
        includeCertifications,
        includeAchievements,
      });
      if (res) {
        setModalResume(res);
        setIsReadyModalVisible(true);
        loadResumes();
      }
    } catch (err: any) {
      Alert.alert('Notice', err?.message || 'Could not generate resume at this time. Please try again.');
    }
  };

  const handleDeleteResume = (documentId?: string) => {
    if (!documentId) return;
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this generated PDF resume from Cloudinary and your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await resumeService.deleteResume(documentId);
              loadResumes();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete resume');
            }
          },
        },
      ]
    );
  };

  const handleEvaluateAts = async () => {
    const roleErr = validateResumeTargetRole(atsTargetRole);
    const textErr = validateAtsResumeText(resumeText);

    if (roleErr || textErr) {
      setAtsErrors({
        atsTargetRole: roleErr || undefined,
        resumeText: textErr || undefined,
      });
      return;
    }
    setAtsErrors({});

    await evaluateResumeAts(resumeText.trim(), atsTargetRole.trim());
  };

  const handleDownload = (resume?: ResumeDto | null) => {
    const target = resume || latestResume;
    const url = target?.pdfDownloadUrl || target?.pdfUrl || `${ENV.API_BASE_URL}/resume/download/current-user`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Download', `PDF Link: ${url}`);
      }
    });
  };

  const handleShareLatex = async (latex?: string) => {
    const content = latex || modalResume?.latexSource || latestResume?.latexSource;
    if (!content) return;
    try {
      await Share.share({
        message: content,
        title: 'ATS Resume LaTeX Source Code',
      });
    } catch {
      // ignored
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="AI Resume & ATS Studio"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AIChat')}
            style={styles.aiCoachButton}
            activeOpacity={0.7}
          >
            <Icon name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.aiCoachText}>AI Coach</Text>
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'BUILDER' && styles.tabItemActive]}
          onPress={() => setActiveTab('BUILDER')}
          activeOpacity={0.7}
        >
          <Icon
            name="file-text"
            size={18}
            color={activeTab === 'BUILDER' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'BUILDER' && styles.tabLabelActive,
            ]}
          >
            PDF Builder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'ATS' && styles.tabItemActive]}
          onPress={() => setActiveTab('ATS')}
          activeOpacity={0.7}
        >
          <Icon
            name="shield-check"
            size={18}
            color={activeTab === 'ATS' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'ATS' && styles.tabLabelActive,
            ]}
          >
            ATS Optimizer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'BUILDER' ? (
          /* TAB 1: BUILDER */
          <View>
            {/* Candidate Header Summary */}
            {profile && (
              <View style={styles.candidateHeader}>
                <Avatar
                  name={profile.fullName || 'Student'}
                  imageUrl={profile.avatarUrl}
                  size={46}
                />
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{profile.fullName}</Text>
                  <Text style={styles.candidateSub} numberOfLines={1}>
                    {profile.institution || 'Verified Student'} • {profile.department || 'Engineering'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.avatarBadge}
                  onPress={() => navigation.navigate('EditProfile')}
                  activeOpacity={0.7}
                >
                  <Icon name="edit" size={14} color={colors.primary} />
                  <Text style={styles.avatarBadgeText}>Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>1. Select Resume Template</Text>
            <View style={styles.templatesGrid}>
              {RESUME_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={[
                      styles.templateCard,
                      isSelected && styles.templateCardSelected,
                    ]}
                    onPress={() => setSelectedTemplate(tmpl.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.templateHeader}>
                      <Text
                        style={[
                          styles.templateName,
                          isSelected && styles.templateNameSelected,
                        ]}
                      >
                        {tmpl.name}
                      </Text>
                      {isSelected ? (
                        <Icon name="check-circle" size={18} color={colors.primary} />
                      ) : null}
                    </View>
                    <Text style={styles.templateDesc}>{tmpl.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing[4] }]}>
              2. Target Role & Content
            </Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Target Job Title</Text>
              <TextInput
                style={[styles.input, builderErrors.targetRole ? styles.inputError : null]}
                value={targetRole}
                onChangeText={(text) => {
                  setTargetRole(text);
                  if (builderErrors.targetRole) {
                    setBuilderErrors((prev) => ({ ...prev, targetRole: undefined }));
                  }
                }}
                placeholder="e.g. Full Stack Software Engineer"
                placeholderTextColor={colors.textMuted}
              />
              {builderErrors.targetRole ? (
                <Text style={styles.fieldError}>{builderErrors.targetRole}</Text>
              ) : null}

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIncludeProjects(!includeProjects)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={includeProjects ? 'check-square' : 'code'}
                    size={20}
                    color={includeProjects ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.checkboxLabel}>Include Highlighted Projects</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIncludeCertifications(!includeCertifications)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={includeCertifications ? 'check-square' : 'award'}
                    size={20}
                    color={includeCertifications ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.checkboxLabel}>Include Certifications</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIncludeAchievements(!includeAchievements)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={includeAchievements ? 'check-square' : 'check'}
                    size={20}
                    color={includeAchievements ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.checkboxLabel}>Include Honors & Awards</Text>
                </TouchableOpacity>
              </View>
            </View>

            <PrimaryButton
              label={isGeneratingResume ? 'Compiling PDF via OpenHTMLtoPDF...' : 'Generate AI Resume'}
              onPress={handleGenerate}
              isLoading={isGeneratingResume}
              disabled={isGeneratingResume}
              style={{ marginTop: spacing[4] }}
            />

            {/* Generated Resumes Section */}
            <View style={styles.resumesSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sectionTitleNoMargin}>My Generated Resumes (PDFs)</Text>
                {myResumes.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{myResumes.length}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={loadResumes}
                disabled={isLoadingResumes}
                style={styles.refreshBtn}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isLoadingResumes ? (
              <View style={styles.resumesLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.resumesLoadingText}>Loading your generated resumes...</Text>
              </View>
            ) : myResumes.length === 0 ? (
              <View style={styles.emptyResumesCard}>
                <Icon name="file-text" size={36} color={colors.textSecondary} />
                <Text style={styles.emptyResumesTitle}>No Resumes Generated Yet</Text>
                <Text style={styles.emptyResumesDesc}>
                  Select an ATS-compliant template above and tap "Generate AI Resume" to create your first verified Cloudinary PDF!
                </Text>
              </View>
            ) : (
              <View style={styles.resumesList}>
                {myResumes.map((item, idx) => {
                  const docId = item.documentId || item.id;
                  const itemTitle = item.fileName || `${item.template} Resume`;
                  return (
                    <View key={docId || idx} style={styles.resumeItemCard}>
                      <View style={styles.resumeItemHeader}>
                        <View style={styles.resumeIconBox}>
                          <Icon name="file-text" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 8 }}>
                          <Text style={styles.resumeItemTitle} numberOfLines={1}>
                            {itemTitle}
                          </Text>
                          <Text style={styles.resumeItemSub}>
                            {item.targetJobTitle || 'Engineering Resume'} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Ready'}
                          </Text>
                        </View>
                        <StatusBadge label={item.template} variant="primary" />
                      </View>

                      <View style={styles.resumeActionsRow}>
                        {item.pdfUrl ? (
                          <TouchableOpacity
                            style={styles.actionPillPrimary}
                            onPress={() => Linking.openURL(item.pdfUrl!)}
                            activeOpacity={0.7}
                          >
                            <Icon name="external-link" size={14} color="#FFFFFF" />
                            <Text style={styles.actionPillPrimaryText}>Preview</Text>
                          </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                          style={styles.actionPillSecondary}
                          onPress={() => handleDownload(item)}
                          activeOpacity={0.7}
                        >
                          <Icon name="download" size={14} color={colors.primary} />
                          <Text style={styles.actionPillSecondaryText}>Download</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionPillDetails}
                          onPress={() => {
                            setModalResume(item);
                            setIsReadyModalVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="code" size={14} color={colors.textSecondary} />
                          <Text style={styles.actionPillDetailsText}>LaTeX</Text>
                        </TouchableOpacity>

                        {docId ? (
                          <TouchableOpacity
                            style={styles.actionPillDelete}
                            onPress={() => handleDeleteResume(docId)}
                            activeOpacity={0.7}
                          >
                            <Icon name="trash" size={15} color={colors.danger} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          /* TAB 2: ATS OPTIMIZER */
          <View>
            <Text style={styles.sectionTitle}>ATS Resume Scanner & Keyword Match</Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Target Role for ATS Benchmark</Text>
              <TextInput
                style={[styles.input, atsErrors.atsTargetRole ? styles.inputError : null]}
                value={atsTargetRole}
                onChangeText={(text) => {
                  setAtsTargetRole(text);
                  if (atsErrors.atsTargetRole) {
                    setAtsErrors((prev) => ({ ...prev, atsTargetRole: undefined }));
                  }
                }}
                placeholder="Target Job Title"
                placeholderTextColor={colors.textMuted}
              />
              {atsErrors.atsTargetRole ? (
                <Text style={styles.fieldError}>{atsErrors.atsTargetRole}</Text>
              ) : null}

              <Text style={[styles.inputLabel, { marginTop: spacing[3] }]}>
                Paste Resume Text or Experience Bullets
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  atsErrors.resumeText ? styles.inputError : null,
                ]}
                value={resumeText}
                onChangeText={(text) => {
                  setResumeText(text);
                  if (atsErrors.resumeText) {
                    setAtsErrors((prev) => ({ ...prev, resumeText: undefined }));
                  }
                }}
                placeholder="Paste your resume content here..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
              />
              {atsErrors.resumeText ? (
                <Text style={styles.fieldError}>{atsErrors.resumeText}</Text>
              ) : null}
            </View>

            <PrimaryButton
              label={isEvaluatingAts ? 'Analyzing with ATS Engine...' : 'Run ATS Evaluation'}
              onPress={handleEvaluateAts}
              isLoading={isEvaluatingAts}
              disabled={isEvaluatingAts}
              style={{ marginTop: spacing[4] }}
            />

            {atsResult && (
              <View style={styles.atsResultCard}>
                <View style={styles.scoreHeader}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{Math.round(atsResult.atsScore)}%</Text>
                    <Text style={styles.scoreLabel}>ATS MATCH</Text>
                  </View>
                  <View style={styles.scoreDetails}>
                    <Text style={styles.detectedRoleTitle}>Detected Role</Text>
                    <Text style={styles.detectedRoleVal}>{atsResult.detectedRole}</Text>
                    <View style={styles.readabilityRow}>
                      <Text style={styles.readabilityLabel}>Readability:</Text>
                      <StatusBadge label={atsResult.readabilityIndex} variant="primary" />
                    </View>
                  </View>
                </View>

                <Text style={styles.keywordsTitle}>High-Impact Missing / Recommended Keywords</Text>
                <View style={styles.keywordChips}>
                  {atsResult.recommendedKeywords.map((kw, idx) => (
                    <View key={idx} style={styles.kwBadge}>
                      <Icon name="plus" size={12} color={colors.primary} />
                      <Text style={styles.kwText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Resume Ready Modal */}
      <Modal
        visible={isReadyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReadyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="check-circle" size={24} color={colors.success} />
                <Text style={styles.modalTitle}>Resume Ready!</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsReadyModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Your tailored ATS resume has been compiled to PDF and hosted on Cloudinary CDN.
            </Text>

            {modalResume && (
              <View style={styles.modalSummaryCard}>
                <Text style={styles.modalFileName} numberOfLines={1}>
                  {modalResume.fileName || `${modalResume.template}_Resume.pdf`}
                </Text>
                <View style={styles.modalBadgeRow}>
                  <StatusBadge label={modalResume.template} variant="primary" />
                  {modalResume.targetJobTitle ? (
                    <StatusBadge label={modalResume.targetJobTitle} variant="neutral" />
                  ) : null}
                </View>
              </View>
            )}

            <View style={styles.modalActionButtons}>
              {/* Preview PDF */}
              {modalResume?.pdfUrl ? (
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => Linking.openURL(modalResume.pdfUrl!)}
                  activeOpacity={0.8}
                >
                  <Icon name="external-link" size={18} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryBtnText}>Preview PDF in Browser</Text>
                </TouchableOpacity>
              ) : null}

              {/* Download / Save PDF */}
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => handleDownload(modalResume)}
                activeOpacity={0.8}
              >
                <Icon name="download" size={18} color={colors.primary} />
                <Text style={styles.modalSecondaryBtnText}>Download / Save PDF</Text>
              </TouchableOpacity>

              {/* View & Copy LaTeX */}
              <TouchableOpacity
                style={styles.modalOutlineBtn}
                onPress={() => handleShareLatex(modalResume?.latexSource)}
                activeOpacity={0.8}
              >
                <Icon name="code" size={18} color={colors.text} />
                <Text style={styles.modalOutlineBtnText}>View & Share LaTeX Source</Text>
              </TouchableOpacity>
            </View>

            {/* Toggle Inline LaTeX */}
            <TouchableOpacity
              style={styles.modalLatexToggle}
              onPress={() => setShowModalLatex(!showModalLatex)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalLatexToggleText}>
                {showModalLatex ? 'Hide Raw LaTeX' : 'Inspect Raw LaTeX Source'}
              </Text>
            </TouchableOpacity>

            {showModalLatex && modalResume?.latexSource && (
              <ScrollView style={styles.modalLatexBox} nestedScrollEnabled>
                <Text style={styles.modalLatexCode}>{modalResume.latexSource}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    aiCoachButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primarySoft,
      borderRadius: radii.full,
    },
    aiCoachText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      paddingVertical: spacing[3],
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabItemActive: {
      borderBottomColor: colors.primary,
    },
    tabLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    scrollContent: {
      padding: spacing[4],
      paddingBottom: spacing[8],
    },
    candidateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[4],
    },
    candidateInfo: {
      flex: 1,
      marginLeft: spacing[3],
    },
    candidateName: {
      ...typography.label,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    candidateSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    avatarBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radii.full,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarBadgeText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    sectionTitle: {
      ...typography.h3,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: spacing[3],
    },
    sectionTitleNoMargin: {
      ...typography.h3,
      fontSize: 16,
      color: colors.textPrimary,
    },
    templatesGrid: {
      gap: spacing[2],
    },
    templateCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[3],
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    templateCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceElevated,
    },
    templateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    templateName: {
      ...typography.label,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    templateNameSelected: {
      color: colors.primary,
    },
    templateDesc: {
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
    inputLabel: {
      ...typography.label,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: spacing[1],
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      color: colors.textPrimary,
      fontSize: 14,
    },
    inputError: {
      borderColor: colors.danger,
      borderWidth: 1.5,
    },
    fieldError: {
      ...typography.caption,
      color: colors.danger,
      marginTop: 4,
      marginLeft: 2,
    },
    multilineInput: {
      minHeight: 110,
      textAlignVertical: 'top',
    },
    toggleRow: {
      marginTop: spacing[3],
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    checkboxLabel: {
      ...typography.bodySmall,
      color: colors.textPrimary,
    },
    resumesSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing[6],
      marginBottom: spacing[3],
    },
    countBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    countBadgeText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
      fontSize: 11,
    },
    refreshBtn: {
      padding: 6,
      borderRadius: radii.sm,
    },
    resumesLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: spacing[4],
    },
    resumesLoadingText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    emptyResumesCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[5],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyResumesTitle: {
      ...typography.label,
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: spacing[2],
    },
    emptyResumesDesc: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 18,
    },
    resumesList: {
      gap: spacing[3],
    },
    resumeItemCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[3],
      borderWidth: 1,
      borderColor: colors.border,
    },
    resumeItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    resumeIconBox: {
      width: 38,
      height: 38,
      borderRadius: 8,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resumeItemTitle: {
      ...typography.label,
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    resumeItemSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    resumeActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing[3],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: spacing[2],
    },
    actionPillPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radii.sm,
    },
    actionPillPrimaryText: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    actionPillSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radii.sm,
    },
    actionPillSecondaryText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    actionPillDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radii.sm,
    },
    actionPillDetailsText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    actionPillDelete: {
      marginLeft: 'auto',
      padding: 6,
      borderRadius: radii.sm,
    },
    atsResultCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[4],
      marginTop: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
      marginBottom: spacing[4],
    },
    scoreCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primarySoft,
      borderWidth: 3,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreNumber: {
      ...typography.h2,
      fontSize: 20,
      color: colors.primary,
      fontWeight: '800',
    },
    scoreLabel: {
      ...typography.caption,
      fontSize: 9,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    scoreDetails: {
      flex: 1,
    },
    detectedRoleTitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    detectedRoleVal: {
      ...typography.body,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    readabilityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    readabilityLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    keywordsTitle: {
      ...typography.label,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: spacing[2],
    },
    keywordChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    kwBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    kwText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[4],
    },
    modalContainer: {
      width: '100%',
      maxWidth: 420,
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
    },
    modalTitle: {
      ...typography.h3,
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    modalSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing[2],
      lineHeight: 18,
    },
    modalSummaryCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      padding: spacing[3],
      marginVertical: spacing[3],
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalFileName: {
      ...typography.label,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: 6,
    },
    modalBadgeRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    modalActionButtons: {
      gap: spacing[2],
      marginTop: spacing[2],
    },
    modalPrimaryBtn: {
      backgroundColor: colors.success,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: spacing[3],
      borderRadius: radii.md,
    },
    modalPrimaryBtnText: {
      ...typography.label,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    modalSecondaryBtn: {
      backgroundColor: colors.primarySoft,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modalSecondaryBtnText: {
      ...typography.label,
      color: colors.primary,
      fontWeight: '700',
    },
    modalOutlineBtn: {
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalOutlineBtnText: {
      ...typography.label,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    modalLatexToggle: {
      alignSelf: 'center',
      marginTop: spacing[3],
    },
    modalLatexToggleText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    modalLatexBox: {
      maxHeight: 140,
      backgroundColor: colors.card,
      borderRadius: radii.sm,
      padding: spacing[3],
      marginTop: spacing[2],
    },
    modalLatexCode: {
      color: colors.textPrimary,
      fontSize: 10,
      fontFamily: 'monospace',
      lineHeight: 14,
    },
  });
