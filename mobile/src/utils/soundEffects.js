import { Vibration, Platform } from 'react-native';

export const playPaymentSuccessSound = async () => {
  try {
    // Joyful celebration tactile vibration pattern (works universally without crashing native runtime)
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 90, 60, 140]);
      } catch (vibErr) {
        // ignore vibration error
      }
    }
  } catch (err) {
    // Fail silently
  }
};
