import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function OutgoingCallScreen({ navigation, route }) {
  const { callerName = 'Mumma' } = route.params || {};
  const end = () => navigation.navigate('Main');
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={["#17121d","#1e1625","#241a2e"]} style={styles.bg} />
      <View style={styles.header}>
        <Text style={styles.caller}>{callerName}</Text>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
      </View>
      <View style={styles.controls}>
        <View style={styles.gridRow}>
          <Circle icon="mic-off" label="mute" />
          <Circle icon="grid" label="keypad" />
          <Circle icon="volume-high" label="speaker" />
        </View>
        <View style={styles.gridRow}>
          <Circle icon="add" label="add call" />
          <Circle icon="videocam" label="FaceTime" />
          <Circle icon="person" label="contacts" />
        </View>
      </View>
      <View style={styles.endArea}>
        <TouchableOpacity style={styles.endCircle} onPress={end}>
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Circle({ icon, label, disabled }) {
  return (
    <View style={styles.circleWrap}>
      <View style={[styles.circle, disabled ? styles.circleDisabled : null]}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1a1420" },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  header: { alignItems: "center", marginTop: 36 },
  caller: { color: "#fff", fontSize: 36, fontWeight: "800", letterSpacing: 0.3 },
  timer: { color: "#eee", fontSize: 14, marginTop: 6 },
  controls: { marginTop: 46, alignSelf: "center", width: "100%", maxWidth: 420, paddingHorizontal: 16 },
  gridRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 22 },
  circleWrap: { alignItems: "center" },
  circle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
  circleDisabled: { backgroundColor: "rgba(255,255,255,0.06)" },
  circleLabel: { color: "#ddd", marginTop: 8, fontSize: 12 },
  endArea: { alignItems: "center", marginTop: 28 },
  endCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#e74c3c", alignItems: "center", justifyContent: "center" },
});