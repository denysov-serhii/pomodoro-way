import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BreakScreenProps {
  sessionType: 'shortBreak' | 'longBreak';
}

const BreakScreen: React.FC<BreakScreenProps> = ({ sessionType }) => {
  const isLongBreak = sessionType === 'longBreak';

  const animals = isLongBreak 
    ? ['🦁', '🐘', '🦒', '🐼', '🦘', '🦔']
    : ['🐱', '🐶', '🐰', '🐨', '🦊', '🐹'];

  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  const messages = isLongBreak
    ? [
        'Great work! Time for a longer break',
        'You\'ve earned this break!',
        'Relax and recharge ✨',
        'Take a deep breath and stretch',
      ]
    : [
        'Time for a quick break!',
        'Rest your eyes for a moment',
        'Grab some water 💧',
        'Stretch and relax',
      ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <View style={[styles.container, isLongBreak ? styles.longBreakBg : styles.shortBreakBg]}>
      <View style={styles.content}>
        <Text style={styles.animalEmoji}>{randomAnimal}</Text>
        <Text style={styles.title}>
          {isLongBreak ? 'Long Break' : 'Short Break'}
        </Text>
        <Text style={styles.message}>{randomMessage}</Text>
        <View style={styles.decorativeDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 30,
    marginVertical: 20,
    marginHorizontal: 10,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortBreakBg: {
    backgroundColor: '#d5f4e6',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  longBreakBg: {
    backgroundColor: '#e8daef',
    borderWidth: 2,
    borderColor: '#8e44ad',
  },
  content: {
    alignItems: 'center',
  },
  animalEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    fontWeight: '500',
  },
  decorativeDots: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot1: {
    backgroundColor: '#27ae60',
  },
  dot2: {
    backgroundColor: '#f39c12',
  },
  dot3: {
    backgroundColor: '#e74c3c',
  },
});

export default BreakScreen;
