import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function FakeCallScreen({ navigation, route }) {
  const { callerName = 'Mom ❤️', callerNumber = '' } = route.params || {};

  const [incoming, setIncoming] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimerRef = useRef(null);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    startRingtone();
    return () => {
      stopRingtone();
      clearInterval(callTimerRef.current);
    };
  }, []);

  const startRingtone = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_f43b0f92e6.mp3?filename=ringtone-6106.mp3' }, {}, true);
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      ringtoneRef.current = sound;
      Vibration.vibrate([500, 500, 500, 500], true);
    } catch {}
  };

  const stopRingtone = async () => {
    try {
      Vibration.cancel();
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      }
    } catch {}
  };

  const accept = async () => {
    await stopRingtone();
    setIncoming(false);
    callTimerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
  };

  const decline = async () => {
    await stopRingtone();
    navigation.navigate('Main');
  };

  const endCall = async () => {
    clearInterval(callTimerRef.current);
    navigation.navigate('Main');
  };

  const formatTime = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: incoming ? '#113a42' : '#1a2a35' }]}> 
      {incoming ? (
        <View style={styles.fullscreen}>
          <View style={styles.topBar}>
            <Text style={styles.incomingTime}>1:08</Text>
          </View>
          <View style={styles.centerArea}>
            <Text style={styles.callerName}>{callerName}</Text>
            <View style={styles.quickRow}>
              <View style={styles.quickItem}>
                <Ionicons name="alarm" size={22} color="#fff" />
                <Text style={styles.quickLabel}>Remind Me</Text>
              </View>
              <View style={styles.quickItem}>
                <Ionicons name="chatbubble" size={22} color="#fff" />
                <Text style={styles.quickLabel}>Message</Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.bottomItem}>
              <TouchableOpacity style={[styles.circleLarge, { backgroundColor: '#e74c3c' }]} onPress={decline}>
                <Ionicons name="call" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.bottomLabel}>Decline</Text>
            </View>
            <View style={styles.bottomItem}>
              <TouchableOpacity style={[styles.circleLarge, { backgroundColor: '#2ecc71' }]} onPress={accept}>
                <Ionicons name="call" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.bottomLabel}>Accept</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.fullscreen}>
          <View style={styles.topBar}>
            <Text style={styles.smallText}>{formatTime(callSeconds)}</Text>
          </View>
          <View style={styles.centerArea}>
            <Text style={styles.callerName}>{callerName}</Text>
            <View style={styles.controlsGrid}>
              <View style={styles.row}>
                <CircleButton icon="volume-high" label="Speaker" />
                <CircleButton icon="videocam" label="FaceTime" disabled />
                <CircleButton icon="mic-off" label="Mute" />
              </View>
              <View style={styles.row}>
                <CircleButton icon="ellipsis-horizontal" label="More" disabled />
                <TouchableOpacity style={[styles.endBtn, { backgroundColor: '#e74c3c' }]} onPress={endCall}>
                  <Text style={styles.endText}>End</Text>
                </TouchableOpacity>
                <CircleButton icon="grid" label="Keypad" />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function CircleButton({ icon, label, disabled }) {
  return (
    <View style={styles.circleWrap}>
      <View style={[styles.circle, { opacity: disabled ? 0.4 : 1 }]}>
        <Ionicons name={icon} size={22} color="#333" />
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullscreen: { flex: 1, justifyContent: 'space-between' },
  topBar: { paddingHorizontal: 24, paddingTop: 12 },
  centerArea: { alignItems: 'center', paddingHorizontal: 24, flexGrow: 1, justifyContent: 'center' },
  headerRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  incomingTime: { color: '#fff', fontSize: 16 },
  smallText: {
    color: '#b08',
    fontSize: 16,
    fontWeight: '600',
  },
  callerName: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  controlsGrid: {
    marginTop: 80,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, width: '60%' },
  quickItem: { alignItems: 'center' },
  quickLabel: { color: '#fff', marginTop: 6 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end', paddingBottom: 28 },
  bottomItem: { alignItems: 'center' },
  circleLarge: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  bottomLabel: { color: '#fff', marginTop: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 28,
  },
  circleWrap: { alignItems: 'center' },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleLabel: { color: '#ddd' },
  endBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: { color: '#fff', fontWeight: '700' },
  answerRow: {
    marginTop: 32,
    alignItems: 'center',
  },
  answerBtn: {
    width: 180,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});