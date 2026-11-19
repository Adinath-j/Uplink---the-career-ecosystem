import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsScreen } from '../../src/screens/settings/SettingsScreen';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

const mockNavigation: any = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: mockGoBack,
};

const mockRoute: any = {
  key: 'settings-key',
  name: 'Settings',
};

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'u-100',
        email: 'adinath@campus.edu',
        fullName: 'Adinath Jadhav',
        role: 'STUDENT',
        institution: 'National Institute of Technology',
        department: 'Computer Science',
        program: 'B.Tech',
        graduationYear: 2027,
        skills: ['React Native', 'Java'],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
      },
      token: 'valid-jwt-token',
    });

    useProfileStore.setState({
      profile: {
        id: 'u-100',
        email: 'adinath@campus.edu',
        fullName: 'Adinath Jadhav',
        role: 'STUDENT',
        institution: 'National Institute of Technology',
        department: 'Computer Science',
        program: 'B.Tech',
        graduationYear: 2027,
        skills: ['React Native', 'Java'],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
      },
    });
  });

  test('renders SettingsScreen tree without errors', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <SettingsScreen navigation={mockNavigation} route={mockRoute} />
        </SafeAreaProvider>
      );
    });

    expect(tree).toBeDefined();
    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Settings');
    expect(str).toContain('Adinath Jadhav');
    expect(str).toContain('adinath@campus.edu');
    expect(str).toContain('Account & Security');
    expect(str).toContain('Notifications');
    expect(str).toContain('About & Legal');
    expect(str).toContain('Terms of Service');
    expect(str).toContain('Privacy Policy');
  });
});
