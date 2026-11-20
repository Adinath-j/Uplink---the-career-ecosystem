import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { storage } from '../services/api/tokenStorage';
import { lightColors, darkColors, ColorPalette } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = '@uplink_pref_theme_mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  colors: lightColors,
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronous read from MMKV to avoid theme flicker on startup
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = storage.getString(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // Ignore MMKV error
    }
    return 'system';
  });

  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null | undefined>(() =>
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const listener = (preferences: { colorScheme?: ColorSchemeName | null }) => {
      setSystemScheme(preferences.colorScheme);
    };
    const sub = Appearance.addChangeListener(listener);
    return () => sub.remove();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      storage.set(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to persist theme mode:', e);
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const value = useMemo(
    () => ({ themeMode, isDark, colors, setThemeMode }),
    [themeMode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Hook to create dynamic stylesheets reactive to theme changes.
 * Supports both `const { styles, colors } = useThemedStyles(factory)`
 * and `const styles = useThemedStyles(factory)`.
 */
export function useThemedStyles<T extends object>(
  stylesFactory: (colors: ColorPalette, isDark: boolean) => T
): T & { styles: T; colors: ColorPalette; isDark: boolean } {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => stylesFactory(colors, isDark), [colors, isDark]);
  return useMemo(() => {
    return Object.assign(Object.create(styles), { styles, colors, isDark });
  }, [styles, colors, isDark]);
}
