import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Linking
} from 'react-native';
import { theme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getCurrentUser } from '../utils/auth';
import { Audio } from 'expo-av';

const emergencyNumbers = [
  { label: 'Police', number: '112' },
  { label: 'Ambulance', number: '102' },
  { label: 'Women Helpline', number: '1091' },
  { label: 'Fire', number: '101' },
];

const STORAGE_KEY = 'trustedContacts';
const FAKE_CALL_SETTINGS_KEY = 'fakeCallSettings';

const HomeScreen = ({ navigation }) => {
  const [holding, setHolding] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [ringAnim] = useState(new Animated.Value(0));
  const holdTimerRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [callTarget, setCallTarget] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [relationInput, setRelationInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const [locationText, setLocationText] = useState('');
  const [userName, setUserName] = useState('');

  const [fakeCallerName, setFakeCallerName] = useState('Mom ❤️');
  const [fakeCallerNumber, setFakeCallerNumber] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setContacts(JSON.parse(stored));
        
        // Get current user's name
        const user = await getCurrentUser();
        if (user && user.name) {
          setUserName(user.name);
        }

        const fcRaw = await AsyncStorage.getItem(FAKE_CALL_SETTINGS_KEY);
        if (fcRaw) {
          const s = JSON.parse(fcRaw);
          if (s.fakeCallerName) setFakeCallerName(s.fakeCallerName);
          if (s.fakeCallerNumber) setFakeCallerNumber(s.fakeCallerNumber);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        let cityText = '';
        try {
          const places = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (places && places[0]) {
            const p = places[0];
            cityText = `${p.city || ''}${p.city && p.region ? ', ' : ''}${p.region || ''}`;
          }
        } catch {}
        setLocationText(`📍 ${cityText} — ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
      } catch {}
    })();
  }, []);

  const startHold = () => {
    setHolding(true);
    setCountdown(3);
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    holdTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(holdTimerRef.current);
          activateSOS();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancelHold = () => {
    if (!holding) return;
    setHolding(false);
    clearInterval(holdTimerRef.current);
    setCountdown(3);
    ringAnim.setValue(0);
  };

  const activateSOS = () => {
    setHolding(false);
    ringAnim.setValue(0);
    // Navigate to SOS calling page
    navigation.navigate('LiveSOS');
  };

  const saveFakeCallSettings = async () => {
    const payload = { fakeCallerName, fakeCallerNumber };
    try {
      await AsyncStorage.setItem(FAKE_CALL_SETTINGS_KEY, JSON.stringify(payload));
    } catch {}
  };

  const triggerFakeCall = async () => {
    await saveFakeCallSettings();
    navigation.navigate('IncomingCall', {
      callerName: fakeCallerName,
      callerNumber: fakeCallerNumber,
    });
  };

  const dismissIncomingCall = async () => {
    setIncomingCallVisible(false);
    await stopRingtone();
    if (autoSOSTimerRef.current) {
      clearTimeout(autoSOSTimerRef.current);
      autoSOSTimerRef.current = null;
    }
  };

  const answerIncomingCall = async () => {
    await dismissIncomingCall();
  };

  const playAlarm = async () => {
    setAlarmActive(true);
    await playRingtone();
  };

  const stopAlarm = async () => {
    setAlarmActive(false);
    await stopRingtone();
  };

  const shareLocationSMS = async () => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) return;
      const body = locationText ? `I'm unsafe — here is my location: ${locationText}` : `I'm unsafe — please check in.`;
      await SMS.sendSMSAsync([], body);
    } catch {}
  };

  const reportArea = () => {
    setAddModalVisible(true);
  };

  const openCallModal = (target) => {
    setCallTarget(target);
    setCallModalVisible(true);
  };

  const saveContact = async () => {
    if (!nameInput || !phoneInput) return;
    const newContact = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      relation: relationInput.trim(),
      phone: phoneInput.trim(),
    };
    const updated = [newContact, ...contacts];
    setContacts(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setNameInput('');
    setRelationInput('');
    setPhoneInput('');
    setAddModalVisible(false);
  };

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  const screenWidth = Dimensions.get('window').width;
  const maxContentWidth = Math.min(screenWidth - 32, 380);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hi, {userName || 'User'} <Text style={styles.emoji}>👋</Text></Text>
            <Text style={styles.subGreeting}>Stay safe today</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Feather name="settings" size={22} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* SOS Card */}
        <View style={styles.sosCard}>
          <TouchableOpacity 
            style={styles.sosButton}
            onPressIn={startHold}
            onPressOut={cancelHold}
          >
            <View style={styles.sosInner}>
              <MaterialCommunityIcons name="shield" size={40} color="#ff5252" />
              <Text style={styles.sosText}>SOS</Text>
              {holding && (
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.sosTitle}>Emergency SOS</Text>
          <Text style={styles.sosDescription}>Press and hold for {countdown} seconds to activate SOS</Text>
        </View>
        
        {/* Trusted Contacts Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="people" size={24} color="#8e44ad" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Trusted Contacts</Text>
            <Text style={styles.infoSubtitle}>{contacts.length} contact{contacts.length !== 1 ? 's' : ''} added</Text>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => navigation.navigate('Contacts')}
            >
              <Text style={styles.infoButtonText}>Manage Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Live Location Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="location" size={24} color="#3498db" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Live Location</Text>
            <Text style={styles.infoSubtitle}>
              Unable to access location. Please enable location services.
            </Text>
            <TouchableOpacity style={styles.infoButton} onPress={shareLocationSMS}>
              <Text style={styles.infoButtonText}>Share My Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fake Call / Distraction Mode */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="call" size={24} color="#2ecc71" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Fake Call / Distraction</Text>
            <Text style={styles.infoSubtitle}>Simulate an incoming call or play an alarm</Text>
            <View style={{ flexDirection:'row', marginBottom:12 }}>
              <TouchableOpacity style={[styles.infoButton, { marginRight:8 }]} onPress={()=>{ setFakeCallerName('Mumma'); setFakeCallerNumber('+91 98xx-xxxx'); }}>
                <Text style={styles.infoButtonText}>Mom</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoButton} onPress={()=>{ setFakeCallerName('Dad'); setFakeCallerNumber('+91 98xx-xxxx'); }}>
                <Text style={styles.infoButtonText}>Dad</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Caller Name" value={fakeCallerName} onChangeText={setFakeCallerName} />
            <TextInput style={styles.input} placeholder="Caller Number" value={fakeCallerNumber} onChangeText={setFakeCallerNumber} keyboardType="phone-pad" />
            <View style={{ flexDirection:'row' }}>
              <TouchableOpacity style={styles.infoButton} onPress={triggerFakeCall}>
                <Text style={styles.infoButtonText}>Trigger Fake Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Emergency Directory Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Feather name="phone" size={24} color="#e74c3c" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Emergency Directory</Text>
            
            <View style={styles.emergencyList}>
              {emergencyNumbers.map((e) => (
                <TouchableOpacity 
                  key={e.number} 
                  style={styles.emergencyItem}
                  onPress={() => Linking.openURL(`tel:${e.number}`)}
                >
                  <View style={styles.emergencyItemLeft}>
                    <Ionicons 
                      name={
                        e.label === 'Police' ? 'shield' : 
                        e.label === 'Ambulance' ? 'time' :
                        e.label === 'Women Helpline' ? 'people' : 'flame'
                      } 
                      size={18} 
                      color="#666" 
                    />
                    <Text style={styles.emergencyLabel}>{e.label}</Text>
                  </View>
                  <Text style={styles.emergencyNumber}>{e.number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <Text style={styles.securityNote}>🔒 Your data is secure and encrypted</Text>
      </ScrollView>
      
      {/* Call Modal */}
      <Modal visible={callModalVisible} transparent animationType="fade">
        <View style={styles.callModal}>
          <View style={styles.callModalContent}>
            <Text style={styles.callModalTitle}>Call {callTarget?.label}</Text>
            <Text style={styles.callNumber}>{callTarget?.number}</Text>
            <View style={styles.callBtnRow}>
              <TouchableOpacity style={[styles.callBtn, styles.callBtnCancel]} onPress={() => setCallModalVisible(false)}>
                <Text style={[styles.callBtnText, styles.callBtnTextCancel]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.callBtn, styles.callBtnCall]} onPress={() => {
                setCallModalVisible(false);
                if (callTarget?.number !== 'Simulated') {
                  Linking.openURL(`tel:${callTarget?.number}`);
                }
              }}>
                <Text style={[styles.callBtnText, styles.callBtnTextCall]}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      
      {/* Add Contact Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.addModal}>
          <View style={styles.addModalContent}>
            <Text style={styles.addModalTitle}>Report Unsafe Area</Text>
            <TextInput
              style={styles.input}
              placeholder="Area Name"
              value={nameInput}
              onChangeText={setNameInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={relationInput}
              onChangeText={setRelationInput}
              multiline
            />
            <View style={styles.addBtnRow}>
              <TouchableOpacity style={[styles.addBtn, styles.addBtnCancel]} onPress={() => setAddModalVisible(false)}>
                <Text style={[styles.addBtnText, styles.addBtnTextCancel]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addBtn, styles.addBtnSave]} onPress={saveContact}>
                <Text style={[styles.addBtnText, styles.addBtnTextSave]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  emoji: {
    fontSize: 20,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // SOS Card
  sosCard: {
    backgroundColor: '#ff5252',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sosInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    color: '#ff5252',
    fontWeight: 'bold',
    marginTop: -5,
  },
  countdownOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 45,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  sosTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sosDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  infoButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Emergency Directory
  emergencyList: {
    marginTop: 8,
  },
  emergencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emergencyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  emergencyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  securityNote: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  
  // Modal Styles
  callModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  callModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  callNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  callBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  callBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  callBtnCancel: {
    backgroundColor: '#f0f0f0',
  },
  callBtnCall: {
    backgroundColor: '#4CAF50',
  },
  callBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  callBtnTextCancel: {
    color: '#333',
  },
  callBtnTextCall: {
    color: 'white',
  },
  
  // Add Modal Styles
  addModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  addBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  addBtnCancel: {
    backgroundColor: '#f0f0f0',
  },
  addBtnSave: {
    backgroundColor: theme.colors.primary,
  },
  addBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  addBtnTextCancel: {
    color: '#333',
  },
  addBtnTextSave: {
    color: 'white',
  },
});

export default HomeScreen;