import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, spacing } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchField } from '../../components/common/SearchField';
import { FilterChips } from '../../components/common/FilterChips';
import { MentorListItem } from '../../components/mentor/MentorListItem';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { useMentorStore } from '../../store/mentorStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Mentors'>,
  NativeStackScreenProps<RootStackParamList>
>;

const DOMAINS = [
  'All',
  'Software Engineering',
  'Product Management',
  'Data Science & AI',
  'System Design',
  'UI/UX',
  'Career Guidance',
];

export const MentorsScreen: React.FC<Props> = ({ navigation }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    mentors,
    selectedDomain,
    searchQuery,
    isLoading,
    error,
    fetchMentors,
    setSelectedDomain,
    setSearchQuery,
  } = useMentorStore();

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMentors();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* 
        Mentors Header:
        Title: Find Mentors on the same row as header actions
      */}
      <AppHeader
        title="Find Mentors"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search mentors by name, company, skill..."
        />
      </View>

      {/* Domain Filter Chips */}
      <View style={styles.domainsRow}>
        <FilterChips
          items={DOMAINS}
          selectedId={selectedDomain}
          onSelect={setSelectedDomain}
        />
      </View>

      {/* Mentors Directory List */}
      {isLoading && !isRefreshing ? (
        <LoadingState message="Finding available mentors..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMentors} />
      ) : mentors.length === 0 ? (
        <EmptyState
          title="No Mentors Found"
          description="Try broadening your domain filter or search term to discover more mentors."
          icon="users"
          actionLabel="View All Mentors"
          onActionPress={() => {
            setSelectedDomain('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <FlatList
          data={mentors}
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
            <MentorListItem
              mentor={item}
              onPress={() =>
                navigation.navigate('MentorDetail', {
                  mentorId: item.id,
                })
              }
              onBookPress={() =>
                navigation.navigate('BookingRequest', {
                  mentorId: item.id,
                  mentorName: item.name,
                  mentorRole: `${item.designation} @ ${item.organization}`,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  domainsRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    flexGrow: 1,
  },
});
