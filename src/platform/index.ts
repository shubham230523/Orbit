import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isDesktop = isWeb && (typeof window !== 'undefined' && /Electron|Nwjs/i.test(navigator.userAgent));

export const platformSelect = <T>(specifics: {
  ios?: T;
  android?: T;
  web?: T;
  native?: T;
  default: T;
}) => Platform.select(specifics) ?? specifics.default;
