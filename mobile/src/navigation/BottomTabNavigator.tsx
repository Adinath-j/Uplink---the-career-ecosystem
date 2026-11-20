import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { colors, typography, useTheme } from '../theme';
import { Icon } from '../components/common/Icon';
import { HomeScreen } from '../screens/home/HomeScreen';
import { JobsScreen } from '../screens/jobs/JobsScreen';
import { NetworkScreen } from '../screens/network/NetworkScreen';
import { QAFeedScreen } from '../screens/qa/QAFeedScreen';
import { MentorsScreen } from '../screens/mentors/MentorsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home" size={size || 22} color={color} />
);

const JobsTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="briefcase" size={size || 22} color={color} />
);

const SendIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="send" size={size || 22} color={color} />
);

const QATabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="help-circle" size={size || 22} color={color} />
);

const MentorsTabIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="users" size={size || 22} color={color} />
);

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.border,
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
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: SendIcon,
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
