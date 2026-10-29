import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';
import { Icon } from '../components/common/Icon';
import { HomeScreen } from '../screens/home/HomeScreen';
import { JobsScreen } from '../screens/jobs/JobsScreen';
import { QAFeedScreen } from '../screens/qa/QAFeedScreen';
import { MentorsScreen } from '../screens/mentors/MentorsScreen';

/**
 * UPLINK Student Bottom Tab Navigator
 *
 * MUST HAVE EXACTLY FOUR TABS:
 * 1. Home
 * 2. Jobs
 * 3. Q&A
 * 4. Mentors
 *
 * Profile is accessible via top-right avatar in the header.
 * Profile MUST NOT be added as a 5th bottom tab.
 */

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home" size={size || 22} color={color} />
);

const JobsTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="briefcase" size={size || 22} color={color} />
);

const QATabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="help-circle" size={size || 22} color={color} />
);

const MentorsTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="users" size={size || 22} color={color} />
);

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 56 + Math.max(insets.bottom, 6),
            paddingBottom: Math.max(insets.bottom, 6),
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: JobsTabIcon,
        }}
      />
      <Tab.Screen
        name="QA"
        component={QAFeedScreen}
        options={{
          tabBarLabel: 'Q&A',
          tabBarIcon: QATabIcon,
        }}
      />
      <Tab.Screen
        name="Mentors"
        component={MentorsScreen}
        options={{
          tabBarLabel: 'Mentors',
          tabBarIcon: MentorsTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
    marginTop: -2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
