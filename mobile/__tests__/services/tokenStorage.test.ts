import { tokenStorage } from '../../src/services/api/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('TokenStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await tokenStorage.clearTokens();
  });

  test('saves and retrieves access token and refresh token', async () => {
    await tokenStorage.setTokens('access_123', 'refresh_456');

    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    expect(accessToken).toBe('access_123');
    expect(refreshToken).toBe('refresh_456');
    expect(tokenStorage.getAccessTokenSync()).toBe('access_123');
  });

  test('clears tokens successfully', async () => {
    await tokenStorage.setTokens('access_123', 'refresh_456');
    await tokenStorage.clearTokens();

    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(tokenStorage.getAccessTokenSync()).toBeNull();
  });

  test('saves and retrieves session data', async () => {
    const session = {
      token: 'jwt_test',
      user: { id: 'u-1', email: 'test@campus.edu', fullName: 'Test User' },
      role: 'STUDENT',
    };

    await tokenStorage.saveSessionData(session);
    const retrieved = await tokenStorage.getSessionData<typeof session>();

    expect(retrieved).toEqual(session);
  });
});

