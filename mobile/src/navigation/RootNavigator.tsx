import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';

// Screens
import { BootstrapScreen } from '../screens/bootstrap/BootstrapScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { OpportunityDetailScreen } from '../screens/jobs/OpportunityDetailScreen';
import { SavedOpportunitiesScreen } from '../screens/jobs/SavedOpportunitiesScreen';
import { MyApplicationsScreen } from '../screens/jobs/MyApplicationsScreen';
import { QuestionDetailScreen } from '../screens/qa/QuestionDetailScreen';
import { AskQuestionScreen } from '../screens/qa/AskQuestionScreen';
import { MentorDetailScreen } from '../screens/mentors/MentorDetailScreen';
import { BookingRequestScreen } from '../screens/mentors/BookingRequestScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={AppNavTheme}>
      <Stack.Navigator
        initialRouteName="Bootstrap"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Bootstrap" component={BootstrapScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        {/* Opportunities Stacks */}
        <Stack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
        <Stack.Screen name="SavedOpportunities" component={SavedOpportunitiesScreen} />
        <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />

        {/* Q&A Stacks */}
        <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
        <Stack.Screen
          name="AskQuestion"
          component={AskQuestionScreen}
          options={{ presentation: 'modal' }}
        />

        {/* Mentors Stacks */}
        <Stack.Screen name="MentorDetail" component={MentorDetailScreen} />
        <Stack.Screen
          name="BookingRequest"
          component={BookingRequestScreen}
          options={{ presentation: 'modal' }}
        />

        {/* Profile Stacks */}
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ presentation: 'modal' }}
        />

        {/* Notifications */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
