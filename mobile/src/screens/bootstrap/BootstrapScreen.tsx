import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Bootstrap'>;

export const BootstrapScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { hydrate: hydratePreferences } = usePreferencesStore();
  const { hydrate: hydrateAuth } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // Hydrate local preferences and auth session in parallel if not already loaded
      await Promise.all([
        !usePreferencesStore.getState().isHydrated ? hydratePreferences() : Promise.resolve(true),
        !useAuthStore.getState().isHydrated ? hydrateAuth() : Promise.resolve(true),
      ]);

      if (!isMounted) return;

      const prefState = usePreferencesStore.getState();
      const authState = useAuthStore.getState();

      if (!prefState.hasCompletedOnboarding) {
        navigation.replace('Onboarding');
      } else if (authState.isAuthenticated && authState.user?.isVerified !== false) {
        navigation.replace('MainTabs', { screen: 'Home' });
      } else if (authState.requiresVerification && authState.unverifiedEmail) {
        navigation.replace('VerifyEmail', { email: authState.unverifiedEmail });
      } else {
        // If onboarding is complete but not authenticated, navigate to SignIn
        navigation.replace('SignIn');
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [hydratePreferences, hydrateAuth, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
