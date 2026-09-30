import { NativeModules, Vibration, Platform } from 'react-native';

export const playPaymentSuccessSound = async () => {
  try {
    // 1. Play joyful celebration tactile vibration pattern (works 100% universally in Expo Go)
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 90, 60, 140]);
      } catch (vibErr) {
        // ignore vibration error
      }
    }

    // 2. Only require expo-av if the native ExponentAV module is actually compiled into this runtime
    const hasNativeAudio = Boolean(
      NativeModules.ExponentAV ||
      global?.expo?.modules?.ExponentAV
    );

    if (!hasNativeAudio) {
      return;
    }

    // Safely load and play audio chime if native module is present
    const expoAv = require('expo-av');
    if (expoAv && expoAv.Audio) {
      await expoAv.Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await expoAv.Audio.Sound.createAsync(
        require('../../assets/sounds/success_chime.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );

      if (sound) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
          }
        });
      }
    }
  } catch (err) {
    // Fail silently without interrupting UI or causing unhandled exceptions
  }
};
