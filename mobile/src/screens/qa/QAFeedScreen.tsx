import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { QAFeedTab, QATopic } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchField } from '../../components/common/SearchField';
import { FilterChips } from '../../components/common/FilterChips';
import { QuestionListItem } from '../../components/qa/QuestionListItem';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useQAStore } from '../../store/qaStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'QA'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FEED_TABS: QAFeedTab[] = [
  'For You',
  'Unanswered',
  'Trending',
  'My Questions',
];

const TOPICS: (QATopic | 'All')[] = [
  'All',
  'DSA',
  'Web Development',
  'AI/ML',
  'Placements',
  'Academics',
  'Project Help',
  'Resume',
  'System Design',
  'DevOps',
];

export const QAFeedScreen: React.FC<Props> = ({ navigation }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    questions,
    activeTab,
    selectedTopic,
    searchQuery,
    isLoading,
    error,
    fetchQuestions,
    setActiveTab,
    setSelectedTopic,
    setSearchQuery,
  } = useQAStore();

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchQuestions();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* 
        Q&A Header:
        Title: Q&A on the same row as header actions
      */}
      <AppHeader
        title="Q&A"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search questions by topic, keyword..."
        />
      </View>

      {/* Main Feed View Tabs: For You, Unanswered, Trending, My Questions */}
      <View style={styles.feedTabsRow}>
        {FEED_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.feedTab, activeTab === tab && styles.feedTabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text
              style={[
                styles.feedTabText,
                activeTab === tab && styles.feedTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Topic Filter Chips */}
      <View style={styles.topicsRow}>
        <FilterChips
          items={TOPICS}
          selectedId={selectedTopic}
          onSelect={(topic) => setSelectedTopic(topic as QATopic | 'All')}
        />
      </View>

      {/* Questions Feed List */}
      {isLoading && !isRefreshing ? (
        <LoadingState message="Loading questions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuestions} />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No Questions in this Section"
          description="Be the first to start a conversation or ask for technical guidance."
          icon="help-circle"
          actionLabel="Ask a Question"
          onActionPress={() => navigation.navigate('AskQuestion')}
        />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <QuestionListItem
              question={item}
              onPress={() =>
                navigation.navigate('QuestionDetail', {
                  questionId: item.id,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Ask Question Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AskQuestion')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Ask a new question"
        style={styles.floatingBtn}
      >
        <Icon name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.floatingBtnText}>Ask Question</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  feedTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing[4],
  },
  feedTab: {
    paddingVertical: spacing[3],
    marginRight: spacing[4],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  feedTabActive: {
    borderBottomColor: colors.primary,
  },
  feedTabText: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  feedTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  topicsRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    paddingBottom: spacing[12] + 40,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: spacing[5],
    right: spacing[4],
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radii.full,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    gap: 6,
  },
  floatingBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
