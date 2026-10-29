import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, typography } from '../../theme';
import { Icon, IconName } from '../../components/common/Icon';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { usePreferencesStore } from '../../store/preferencesStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: IconName;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Unified Professional Profile',
    subtitle: 'Academic & Professional Identity',
    description:
      'Consolidate your coursework, projects, internships, verified skills, and academic achievements in one structured ecosystem.',
    icon: 'user',
  },
  {
    id: '2',
    title: 'Curated Opportunities',
    subtitle: 'Internships, Hackathons & Roles',
    description:
      'Discover internships, competitions, scholarships, and career openings verified by participating organizations.',
    icon: 'briefcase',
  },
  {
    id: '3',
    title: 'Campus Q&A & Mentorship',
    subtitle: 'Structured Knowledge Sharing',
    description:
      'Collaborate with university peers to resolve technical doubts and schedule guidance sessions with verified industry mentors.',
    icon: 'help-circle',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingCompleted } = usePreferencesStore();

  const handleFinishOnboarding = async () => {
    await setOnboardingCompleted(true);
    navigation.replace('SignIn');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinishOnboarding();
    }
  };

  const handleSkip = () => {
    handleFinishOnboarding();
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing[4]) },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>UPLINK</Text>
        </View>

        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.iconWrapper}>
              <Icon name={item.icon} size={44} color={colors.primary} />
            </View>

            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
      />

      {/* Pagination dots & Navigation controls */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <PrimaryButton
          label={isLastSlide ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          size="lg"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    height: 48,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  skipButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  skipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  skipPlaceholder: {
    width: 40,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  slideSubtitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[1],
  },
  slideTitle: {
    ...typography.screenTitle,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  slideDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing[4],
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: colors.border,
  },
  actionButton: {
    width: '100%',
  },
});
