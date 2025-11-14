import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { theme, commonStyles } from '../utils/theme';
import { sendCheckInEmail } from '../utils/alerts';

const CONTACTS_KEY = 'trustedContacts';

export default function CheckInScreen() {
  const [intervalMin, setIntervalMin] = useState('5');
  const [graceMin, setGraceMin] = useState('1');
  const [durationMin, setDurationMin] = useState('0');
  const [message, setMessage] = useState('Please confirm you are safe');

  const [active, setActive] = useState(false);
  const [nextDueTs, setNextDueTs] = useState(null);
  const [endTs, setEndTs] = useState(null);
  const timerRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [tick, setTick] = useState(0); // forces UI updates for countdown
  const [inBuffer, setInBuffer] = useState(false); // whether we're in emergency buffer countdown
  const [bufferUntilTs, setBufferUntilTs] = useState(null); // buffer countdown target

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CONTACTS_KEY);
        if (stored) setContacts(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      const now = Date.now();
      if (endTs && now > endTs) {
        cancelCheckIn();
        return;
      }

      const g = Math.max(0, Number(graceMin || '0'));
      // When main countdown reaches zero, transition into emergency buffer countdown
      if (!inBuffer && nextDueTs && now >= nextDueTs) {
        if (g > 0) {
          setInBuffer(true);
          setBufferUntilTs(nextDueTs + g * 60 * 1000);
        } else {
          // no buffer configured, trigger immediately
          triggerMissedCheckIn();
          return;
        }
      }

      // If buffer countdown has elapsed, trigger alerts
      if (inBuffer && bufferUntilTs && now > bufferUntilTs) {
        triggerMissedCheckIn();
        return;
      }

      // advance a tick to update countdown UI each second
      setTick((t) => (t + 1) % 1000000);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, nextDueTs, graceMin, endTs, inBuffer, bufferUntilTs]);

  const startCheckIn = () => {
    const i = Math.max(1, Number(intervalMin || '5'));
    const d = Math.max(0, Number(durationMin || '0'));
    setActive(true);
    setNextDueTs(Date.now() + i * 60 * 1000);
    setEndTs(d > 0 ? Date.now() + d * 60 * 1000 : null);
    setInBuffer(false);
    setBufferUntilTs(null);
    Alert.alert('Check-In scheduled', 'You will be reminded to confirm.');
  };

  const confirmNow = () => {
    // On confirm, stop the active check-in and return to the input/setup view
    cancelCheckIn();
    Alert.alert('Check-In confirmed', 'Timer stopped. You can start a new check-in.');
  };

  const snoozeFive = () => {
    if (inBuffer) {
      setBufferUntilTs((prev) => (prev ? prev + 5 * 60 * 1000 : Date.now() + 5 * 60 * 1000));
    } else {
      setNextDueTs((prev) => (prev ? prev + 5 * 60 * 1000 : Date.now() + 5 * 60 * 1000));
    }
  };

  const cancelCheckIn = () => {
    setActive(false);
    setNextDueTs(null);
    setEndTs(null);
    setInBuffer(false);
    setBufferUntilTs(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatRemaining = () => {
    const target = inBuffer ? bufferUntilTs : nextDueTs;
    if (!target) return '—';
    const diff = Math.max(0, target - Date.now());
    const m = Math.floor(diff / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerMissedCheckIn = async () => {
    cancelCheckIn();
    try {
      let locationUrl = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = pos.coords || {};
          locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        }
      } catch {}

      const emailOk = await sendCheckInEmail(contacts, `CHECK-IN MISSED: ${message}`, locationUrl);
      if (!emailOk) {
        const phoneNumbers = contacts.filter(c => c.phone).map(c => c.phone);
        const body = `CHECK-IN MISSED: ${message}${locationUrl ? `\nLocation: ${locationUrl}` : ''}`;
        try {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable && phoneNumbers.length > 0) {
            await SMS.sendSMSAsync(phoneNumbers, body);
          } else {
            for (const n of phoneNumbers) {
              try { await Linking.openURL(`sms:${n}?body=${encodeURIComponent(body)}`); } catch {}
            }
          }
        } catch {}
      }

      Alert.alert('Check-In missed', 'Trusted contacts have been alerted.');
    } catch (e) {
      Alert.alert('Error', 'Could not send alerts. Please check your network.');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top','bottom','left','right']}>
      <LinearGradient colors={['#fff', '#fff']} style={{ flex: 1 }}>
        <Text style={styles.title}>Timely Check-In</Text>

        {!active ? (
          <View style={styles.card}>
            <TextInput
              placeholder="Interval (minutes)"
              placeholderTextColor="#999"
              value={intervalMin}
              onChangeText={(t) => setIntervalMin(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Grace Period (minutes)"
              placeholderTextColor="#999"
              value={graceMin}
              onChangeText={(t) => setGraceMin(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Duration (minutes, 0 for indefinite)"
              placeholderTextColor="#999"
              value={durationMin}
              onChangeText={(t) => setDurationMin(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Reminder Message"
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={startCheckIn}>
              <Text style={styles.primaryBtnText}>Start Check-In</Text>
            </TouchableOpacity>
            <Text style={styles.note}>Notifications not enabled; reminders will display as in-app alerts.</Text>
          </View>
        ) : (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>Active Check-In</Text>
            <Text style={styles.nextDue}>{inBuffer ? 'Emergency countdown: ' : 'Next due in: '}<Text style={styles.countdown}>{formatRemaining()}</Text></Text>
            <Text style={styles.msgQuoted}>
              "{message}"
            </Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.actionBtn, styles.green]} onPress={confirmNow}>
                <Text style={styles.actionText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.yellow]} onPress={snoozeFive}>
                <Text style={styles.actionText}>Snooze 5m</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.actionBtn, styles.red]} onPress={cancelCheckIn}>
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12, alignSelf: 'center' },
  card: { ...commonStyles.card, padding: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10, color: '#222' },
  primaryBtn: { ...commonStyles.button, marginTop: 6 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  note: { color: '#777', fontSize: 12, marginTop: 8 },
  activeCard: { ...commonStyles.card, padding: 16 },
  activeTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.accent, marginBottom: 6 },
  nextDue: { fontSize: 16, color: theme.colors.text },
  countdown: { fontWeight: 'bold', color: theme.colors.primary },
  msgQuoted: { marginTop: 8, fontStyle: 'italic', color: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  green: { backgroundColor: '#2ecc71' },
  yellow: { backgroundColor: '#f1c40f' },
  red: { backgroundColor: '#e74c3c', marginTop: 10 },
});