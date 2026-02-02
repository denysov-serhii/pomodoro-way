import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

let audioPlayer: AudioPlayer | null = null;

export const playNotificationSound = async () => {
  try {
    // Unload previous sound if it exists
    if (audioPlayer) {
      audioPlayer.remove();
      audioPlayer = null;
    }

    // Create and play a simple notification sound using local asset
    audioPlayer = createAudioPlayer(require('../../assets/sounds/notification.wav'));
    audioPlayer.play();
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
};

export const initializeAudio = async () => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
    });
  } catch (error) {
    console.warn('Error initializing audio:', error);
  }
};
