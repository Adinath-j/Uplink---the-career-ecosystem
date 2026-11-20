import React, { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import { ENV } from '../config/env';
import { storage } from '../services/api/tokenStorage';
import { prefetchPostAuthData, purgeAllScopedCaches } from '../lib/queryClient';
import { websocketService } from '../services/api/websocketService';
import { usePreferencesStore } from '../store/preferencesStore';
import { useAuthStore } from '../store/authStore';
import { useMessagingStore } from '../store/messagingStore';
import { InAppNotificationBanner } from '../components/common/InAppNotificationBanner';

// Screens
import { BootstrapScreen } from '../screens/bootstrap/BootstrapScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
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
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ConversationsScreen } from '../screens/messaging/ConversationsScreen';
import { ChatScreen } from '../screens/messaging/ChatScreen';
import { AssessmentListScreen } from '../screens/assessments/AssessmentListScreen';
import { QuizScreen } from '../screens/assessments/QuizScreen';
import { AIChatScreen } from '../screens/ai/AIChatScreen';
import { ResumeBuilderScreen } from '../screens/resume/ResumeBuilderScreen';
import { VerificationUploadScreen } from '../screens/verification/VerificationUploadScreen';
import { PublicProfileScreen } from '../screens/profile/PublicProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  const dynamicNavTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    }),
    [colors, isDark]
  );
  useEffect(() => {
    // Reconnect STOMP whenever application transitions into active foreground
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && useAuthStore.getState().isAuthenticated) {
        websocketService.connect();
      }
    });
    return () => sub.remove();
  }, []);

  const handleReady = async () => {
    try {
      // Purge stale offline caches if backend target changed
      const LAST_ENV_KEY = '@uplink_last_api_base';
      const lastBase = storage.getString(LAST_ENV_KEY);
      if (lastBase && lastBase !== ENV.API_BASE_URL) {
        purgeAllScopedCaches();
      }
      storage.set(LAST_ENV_KEY, ENV.API_BASE_URL);

      await Promise.all([
        usePreferencesStore.getState().hydrate(),
        useAuthStore.getState().hydrate(),
      ]);

      // If signed in, eagerly connect WebSocket & prefetch profile and inbox in parallel
      if (useAuthStore.getState().isAuthenticated) {
        useMessagingStore.getState().initSocket();
        prefetchPostAuthData();
      }
    } catch (error) {
      console.warn('[RootNavigator] Initial hydration error:', error);
    } finally {
      await BootSplash.hide({ fade: true });
    }
  };

  return (
    <NavigationContainer ref={navigationRef} theme={dynamicNavTheme} onReady={handleReady}>
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
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
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
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Notifications */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Messaging & Chat */}
        <Stack.Screen name="Conversations" component={ConversationsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Skill Assessments */}
        <Stack.Screen name="AssessmentList" component={AssessmentListScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />

        {/* AI & Resume */}
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />

        {/* Verification */}
        <Stack.Screen name="VerificationUpload" component={VerificationUploadScreen} />

        {/* Public Profile */}
        <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      </Stack.Navigator>

      {/* Global In-App Real-Time Notification & Direct Message Banner */}
      <InAppNotificationBanner
        onNavigateToChat={(conversationId, title) => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Chat', { conversationId, title });
          }
        }}
        onNavigateToNotifications={() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Notifications');
          }
        }}
      />
    </NavigationContainer>
  );
};
