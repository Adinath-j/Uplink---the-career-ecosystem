import { NavigatorScreenParams } from '@react-navigation/native';
import { OpportunityCategory, QATopic } from './models';

/**
 * Navigation Types for UPLINK React Navigation 7
 * Source of truth: docs/NAVIGATION.md
 */

export type MainTabParamList = {
  Home: undefined;
  Jobs: { initialCategory?: OpportunityCategory } | undefined;
  Network: undefined;
  QA: { initialTopic?: QATopic } | undefined;
  Mentors: undefined;
};

export type RootStackParamList = {
  Bootstrap: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // Modals and shared detail screens
  OpportunityDetail: { opportunityId: string };
  SavedOpportunities: undefined;
  MyApplications: undefined;

  QuestionDetail: { questionId: string };
  AskQuestion: undefined;

  MentorDetail: { mentorId: string };
  BookingRequest: {
    mentorId: string;
    mentorName: string;
    mentorRole: string;
  };

  MyProfile: undefined;
  EditProfile: undefined;
  Notifications: undefined;

  // Messaging & Chat
  Conversations: undefined;
  Chat: {
    conversationId: string;
    title?: string;
  };

  // Skill Assessments
  AssessmentList: undefined;
  Quiz: {
    assessmentId: string;
    title?: string;
  };

  // AI & Resume
  AIChat: undefined;
  ResumeBuilder: undefined;

  // Verification
  VerificationUpload: undefined;

  // Public Profile
  PublicProfile: {
    userId: string;
    fullName?: string;
  };
};

