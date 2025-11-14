import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';
import * as SMS from 'expo-sms';

const HISTORY_KEY = 'sosHistory';

const LiveSOSModal = ({ navigation }) => {
  const [countdown, setCountdown] = useState(3);
  const [active, setActive] = useState(false);
  const [loc, setLoc] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [locationString, setLocationString] = useState('');
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Flash animation
  useEffect(() => {
    const flashSequence = Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
      }),
    ]);

    Animated.loop(flashSequence, { iterations: 10 }).start();
    
    return () => flashAnim.stopAnimation();
  }, []);

  // Load contacts
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('trustedContacts');
        if (stored) setContacts(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // SOS activation
  useEffect(() => {
    (async () => {
      if (countdown === 0 && !active) {
        setActive(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({});
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setLoc({ lat, lon });
            setLocationString(`https://maps.google.com/?q=${lat},${lon}`);
            
            // Send SOS messages to trusted contacts
            sendSOSMessages(lat, lon);
          }
        } catch {}
        
        // Save a history event
        const evt = { id: Date.now(), timestamp: Date.now(), location: null };
        if (loc) evt.location = loc;
        try {
          const stored = await AsyncStorage.getItem(HISTORY_KEY);
          const arr = stored ? JSON.parse(stored) : [];
          arr.unshift(evt);
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
        } catch {}
      }
    })();
  }, [countdown]);
  
  // Send SOS messages to trusted contacts
  const sendSOSMessages = async (lat, lon) => {
    if (contacts.length === 0) return;
    
    const locationUrl = `https://maps.google.com/?q=${lat},${lon}`;
    const message = `EMERGENCY SOS ALERT: Help me, I'm in danger! My current location: ${locationUrl}`;
    
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const phoneNumbers = contacts.map(contact => contact.phone);
        await SMS.sendSMSAsync(phoneNumbers, message);
      } else {
        // Fallback to individual messages if batch SMS not available
        for (const contact of contacts) {
          try {
            const url = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
            await Linking.openURL(url);
          } catch {}
        }
      }
    } catch {}
  };

  const cancel = () => navigation.goBack();
  
  const endSOS = () => {
    Alert.alert(
      "End SOS Mode",
      "Are you sure you want to end SOS mode?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End SOS", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };

  // Background color animation for flashing red effect
  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e74c3c', '#ff0000']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: !active ? theme.colors.danger : backgroundColor }]}> 
      {!active ? (
        <>
          <Text style={styles.title}>SOS Countdown</Text>
          <Text style={styles.countdown}>SOS in {countdown}…</Text>
          <Text style={styles.description}>Cancel anytime before activation.</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>SOS Active</Text>
          <Text style={styles.description}>
            Emergency alert sent to {contacts.length} trusted contacts.
            {locationString ? '\n\nSharing your live location.' : ''}
          </Text>
          {locationString && (
            <View style={styles.locationBox}>
              <Text style={styles.locationText}>
                Your location is being shared every 10 seconds
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.endButton} onPress={endSOS}>
            <Text style={styles.endText}>End SOS</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 16,
    textAlign: 'center',
  },
  countdown: { 
    fontSize: 36, 
    color: '#fff', 
    marginBottom: 16,
    fontWeight: 'bold',
  },
  description: { 
    fontSize: 18, 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 24,
  },
  locationBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelButton: { 
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelText: { 
    color: theme.colors.danger, 
    fontWeight: '700',
    fontSize: 18,
  },
  endButton: { 
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  endText: { 
    color: theme.colors.danger, 
    fontWeight: '700',
    fontSize: 18,
  },
});

export default LiveSOSModal;