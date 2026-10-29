import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { OpportunityListItem } from '../../components/opportunity/OpportunityListItem';
import { EmptyState } from '../../components/common/EmptyState';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useOpportunityStore } from '../../store/opportunityStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedOpportunities'>;

export const SavedOpportunitiesScreen: React.FC<Props> = ({ navigation }) => {
  const { bookmarkedOpportunityIds } = usePreferencesStore();
  const { opportunities } = useOpportunityStore();

  const savedOpportunities = opportunities.filter((o) =>
    bookmarkedOpportunityIds.includes(o.id)
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Saved Opportunities"
        onBackPress={() => navigation.goBack()}
      />

      {savedOpportunities.length === 0 ? (
        <EmptyState
          title="No Saved Opportunities"
          description="Bookmark internships, hackathons, or jobs to compare and apply later."
          icon="bookmark"
          actionLabel="Explore Opportunities"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Jobs' })}
        />
      ) : (
        <FlatList
          data={savedOpportunities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OpportunityListItem
              opportunity={item}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: item.id,
                })
              }
            />
          )}
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
});
