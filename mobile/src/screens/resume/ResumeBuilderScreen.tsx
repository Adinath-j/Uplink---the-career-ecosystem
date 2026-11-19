import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { colors, typography, spacing, radii } from '../../theme';
import { useAiStore } from '../../store/aiStore';
import { ENV } from '../../config/env';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RESUME_TEMPLATES = [
  { id: 'MODERN', name: 'Modern Tech', desc: 'Sleek 2-column layout favored by high-growth startups & scaleups.' },
  { id: 'CLASSIC', name: 'Classic Corporate', desc: 'Standard traditional serif format preferred by enterprise & banking.' },
  { id: 'ACADEMIC', name: 'Academic CV', desc: 'Comprehensive structure with focus on research, publications & education.' },
  { id: 'EXECUTIVE', name: 'Executive Leader', desc: 'High-impact layout emphasizing leadership metrics and outcomes.' },
];

export const ResumeBuilderScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    latestResume,
    isGeneratingResume,
    generateNewResume,
    atsResult,
    isEvaluatingAts,
    evaluateResumeAts,
  } = useAiStore();

  const [activeTab, setActiveTab] = useState<'BUILDER' | 'ATS'>('BUILDER');

  // Generator state
  const [selectedTemplate, setSelectedTemplate] = useState('MODERN');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeCertifications, setIncludeCertifications] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);

  // ATS state
  const [resumeText, setResumeText] = useState('');
  const [atsTargetRole, setAtsTargetRole] = useState('Software Engineer');
  const [showLatex, setShowLatex] = useState(false);

  const handleGenerate = async () => {
    try {
      const res = await generateNewResume({
        template: selectedTemplate,
        targetRole,
        includeProjects,
        includeCertifications,
        includeAchievements,
      });
      if (res) {
        Alert.alert('Resume Generated', 'Your AI-tailored resume is ready for download!');
      }
    } catch {
      Alert.alert('Notice', 'Could not generate resume at this time. Please try again.');
    }
  };

  const handleEvaluateAts = async () => {
    if (!resumeText.trim()) {
      Alert.alert('Input Required', 'Please enter your resume text or bullet points to evaluate.');
      return;
    }
    await evaluateResumeAts(resumeText, atsTargetRole);
  };

  const handleDownload = () => {
    const url = latestResume?.pdfDownloadUrl || `${ENV.API_BASE_URL}/resume/download/current-user`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Download', `PDF Link: ${url}`);
      }
    });
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
            LaTeX Builder
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
                style={styles.input}
                value={targetRole}
                onChangeText={setTargetRole}
                placeholder="e.g. Lead Mobile Engineer"
                placeholderTextColor={colors.textSecondary}
              />

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
              label={isGeneratingResume ? 'Compiling LaTeX PDF...' : 'Generate AI Resume'}
              onPress={handleGenerate}
              isLoading={isGeneratingResume}
              disabled={isGeneratingResume}
              style={{ marginTop: spacing[4] }}
            />

            {/* Generated Resume Card */}
            {latestResume && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View>
                    <Text style={styles.resultTitle}>Resume v{latestResume.version}</Text>
                    <Text style={styles.resultSubtitle}>
                      Template: {latestResume.template}
                    </Text>
                  </View>
                  <StatusBadge label="READY" variant="success" />
                </View>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownload}
                  activeOpacity={0.7}
                >
                  <Icon name="download" size={18} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.latexToggle}
                  onPress={() => setShowLatex(!showLatex)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.latexToggleText}>
                    {showLatex ? 'Hide LaTeX Code' : 'View LaTeX Code'}
                  </Text>
                </TouchableOpacity>

                {showLatex && (
                  <View style={styles.latexBox}>
                    <Text style={styles.latexText}>{latestResume.latexSource}</Text>
                  </View>
                )}
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
                style={styles.input}
                value={atsTargetRole}
                onChangeText={setAtsTargetRole}
                placeholder="Target Job Title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { marginTop: spacing[3] }]}>
                Paste Resume Text or Experience Bullets
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={resumeText}
                onChangeText={setResumeText}
                placeholder="Paste your resume content here..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={6}
              />
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
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#EFF6FF',
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
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing[3],
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
    backgroundColor: '#F8FAFC',
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
    color: colors.text,
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
    color: colors.text,
    marginBottom: spacing[1],
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
    color: colors.text,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  resultTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  resultSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  downloadButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: radii.md,
    marginTop: spacing[2],
  },
  downloadButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  latexToggle: {
    alignSelf: 'center',
    marginTop: spacing[3],
  },
  latexToggleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  latexBox: {
    backgroundColor: '#1E293B',
    borderRadius: radii.sm,
    padding: spacing[3],
    marginTop: spacing[2],
  },
  latexText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
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
    backgroundColor: '#EFF6FF',
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
    color: colors.text,
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
    color: colors.text,
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
    backgroundColor: '#F3F4F6',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kwText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
});
