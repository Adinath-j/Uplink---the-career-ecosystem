/* eslint-disable no-undef */
import 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(),
  isVisible: jest.fn().mockReturnValue(false),
  useHideAnimation: jest.fn().mockReturnValue({
    container: {},
    logo: { source: 0 },
    brand: { source: 0 },
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-mmkv', () => {
  const storageMap = new Map();
  const createMMKV = () => ({
    set: jest.fn((key, value) => {
      storageMap.set(key, String(value));
    }),
    getString: jest.fn((key) => {
      const val = storageMap.get(key);
      return val !== undefined ? String(val) : undefined;
    }),
    getNumber: jest.fn((key) => {
      const val = storageMap.get(key);
      return val !== undefined ? Number(val) : undefined;
    }),
    getBoolean: jest.fn((key) => {
      const val = storageMap.get(key);
      return val !== undefined ? val === 'true' || val === true : undefined;
    }),
    remove: jest.fn((key) => storageMap.delete(key)),
    delete: jest.fn((key) => storageMap.delete(key)),
    contains: jest.fn((key) => storageMap.has(key)),
    getAllKeys: jest.fn(() => Array.from(storageMap.keys())),
    clearAll: jest.fn(() => storageMap.clear()),
  });

  return {
    createMMKV,
    MMKV: class {
      constructor() {
        return createMMKV();
      }
    },
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_, prop) => (props) =>
        React.createElement(View, { testID: `lucide-${String(prop)}`, ...props }),
    }
  );
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(c => c),
    Directions: {},
  };
});
