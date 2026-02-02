import { Audio } from 'expo-av';

let soundObject: Audio.Sound | null = null;

export const playNotificationSound = async () => {
  try {
    // Unload previous sound if it exists
    if (soundObject) {
      soundObject.setOnPlaybackStatusUpdate(null);
      await soundObject.unloadAsync();
      soundObject = null;
    }

    // Create and play a simple notification sound
    const { sound } = await Audio.Sound.createAsync(
      // Using a simple beep sound - we'll use expo-av's built-in notification sound
      // For a custom sound file, you would use: require('../../assets/sounds/notification.mp3')
      { uri: 'https://cdn.pixabay.com/audio/2023/12/25/audio_f75bd38b14.mp3' }, // Simple notification sound
      { shouldPlay: true, volume: 1.0 }
    );
    
    soundObject = sound;

    // Unload the sound after it finishes playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
};

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.warn('Error initializing audio:', error);
  }
};
