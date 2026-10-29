import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Bootstrap'>;

export const BootstrapScreen: React.FC<Props> = ({ navigation }) => {
  const { hydrate } = usePreferencesStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      // Hydrate local preferences
      await hydrate();

      const state = usePreferencesStore.getState();

      if (!state.hasCompletedOnboarding) {
        navigation.replace('Onboarding');
      } else if (isAuthenticated) {
        navigation.replace('MainTabs', { screen: 'Home' });
      } else {
        // If onboarding is complete but not authenticated, go to SignIn
        navigation.replace('SignIn');
      }
    };

    bootstrap();
  }, [hydrate, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
