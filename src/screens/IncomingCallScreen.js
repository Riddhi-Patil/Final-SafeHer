import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function IncomingCallScreen({ navigation, route }) {
  const { callerName = 'Mom ❤️', callerNumber = '' } = route.params || {};
  useEffect(() => {}, []);
  const accept = () => {
    navigation.replace('OutgoingCall', { callerName, callerNumber });
  };
  const decline = () => {
    navigation.navigate('Main');
  };
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={["#083134","#0c4240","#0f4e49"]} style={styles.bg} />
      <View style={styles.topBar}>
        <Text style={styles.time}>1:08</Text>
        <View style={styles.statusRight}>
          <Ionicons name="cellular" size={16} color="#fff" style={styles.statusIcon} />
          <Ionicons name="wifi" size={16} color="#fff" style={styles.statusIcon} />
          <Ionicons name="battery-half" size={16} color="#fff" />
        </View>
      </View>
      <View style={styles.center}>
        <Text style={styles.caller}>{callerName}</Text>
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
          <TouchableOpacity style={[styles.circle, styles.red]} onPress={decline}>
            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <Ionicons name="call" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.bottomLabel}>Decline</Text>
        </View>
        <View style={styles.bottomItem}>
          <TouchableOpacity style={[styles.circle, styles.green]} onPress={accept}>
            <Ionicons name="call" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.bottomLabel}>Accept</Text>
        </View>
      </View>
      <View style={styles.homeBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b2f33" },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 4 },
  time: { color: "#fff", fontSize: 14, fontWeight: "600" },
  statusRight: { flexDirection: "row", alignItems: "center" },
  statusIcon: { marginRight: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  caller: { color: "#fff", fontSize: 38, fontWeight: "800", letterSpacing: 0.2 },
  quickRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "80%", maxWidth: 320, marginTop: 44 },
  quickItem: { alignItems: "center" },
  quickLabel: { color: "#fff", marginTop: 6, fontSize: 12 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 26, paddingHorizontal: 24, alignSelf: "center", width: "100%", maxWidth: 360 },
  bottomItem: { alignItems: "center" },
  circle: { width: 86, height: 86, borderRadius: 43, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 8, elevation: 6 },
  red: { backgroundColor: "#e74c3c" },
  green: { backgroundColor: "#2ecc71" },
  bottomLabel: { color: "#fff", marginTop: 8, fontSize: 12 },
  homeBar: { position: "absolute", left: "50%", bottom: 6, width: 124, height: 5, backgroundColor: "#fff", borderRadius: 3, marginLeft: -62 },
});