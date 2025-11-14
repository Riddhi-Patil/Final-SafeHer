import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, commonStyles } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const STORAGE_KEY = 'trustedContacts';

const ContactsScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [testSOSModalVisible, setTestSOSModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [relationInput, setRelationInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [currentContact, setCurrentContact] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setContacts(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  const saveContact = async () => {
    const normalizedPhone = (phoneInput || '').replace(/\D/g, '');
    if (!nameInput || !normalizedPhone) return;
    if (normalizedPhone.length !== 10) {
      Alert.alert('Invalid Contact Number', 'Please enter a 10-digit contact number.');
      return;
    }

    const email = (emailInput || '').trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (editModalVisible && currentContact) {
      const updated = contacts.map(c => 
        c.id === currentContact.id 
          ? { ...c, name: nameInput.trim(), relation: relationInput.trim(), phone: normalizedPhone, email }
          : c
      );
      setContacts(updated);
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      setEditModalVisible(false);
    } else {
      const newContact = {
        id: Date.now().toString(),
        name: nameInput.trim(),
        relation: relationInput.trim(),
        phone: normalizedPhone,
        email,
      };
      const updated = [newContact, ...contacts];
      setContacts(updated);
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      setAddModalVisible(false);
    }

    setNameInput('');
    setRelationInput('');
    setPhoneInput('');
    setEmailInput('');
    setCurrentContact(null);
  };

  const editContact = (contact) => {
    setCurrentContact(contact);
    setNameInput(contact.name);
    setRelationInput(contact.relation || '');
    setPhoneInput(contact.phone);
    setEmailInput(contact.email || '');
    setEditModalVisible(true);
  };

  const deleteContact = async (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            const updated = contacts.filter(c => c.id !== contactId);
            setContacts(updated);
            try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          } 
        }
      ]
    );
  };

  const testSOS = (contact) => {
    setCurrentContact(contact);
    setTestSOSModalVisible(true);
  };

  const sendTestSOS = async () => {
    if (!currentContact) return;
    const message = 'TEST SOS ALERT from SafeHer App: This is a test message.';
    try { await Linking.openURL(`sms:${currentContact.phone}?body=${encodeURIComponent(message)}`); } catch {}
    Alert.alert('Test SOS Sent', `A test SOS message was sent to ${currentContact.name}.`);
    setTestSOSModalVisible(false);
    setCurrentContact(null);
  };

  const renderContactItem = ({ item }) => {
    const initial = (item?.name || '?').charAt(0).toUpperCase();
    return (
      <View style={styles.contactItem}>
        <LinearGradient colors={theme.gradients?.sos || ['#6C4AE2','#FF5E8A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarLetter}>{initial}</Text>
        </LinearGradient>
        <View style={styles.contactContent}>
          <Text style={styles.contactName}>{item.name}</Text>
          <View style={styles.chipsRow}>
            {!!item.relation && (
              <View style={styles.chip}><Text style={styles.chipText}>{item.relation}</Text></View>
            )}
            <TouchableOpacity style={styles.testSOSChip} onPress={() => testSOS(item)}>
              <Text style={styles.testSOSText}>Test SOS</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bitsRow}>
            {!!item.phone && (
              <View style={styles.bit}><Feather name="phone" size={14} color="#666" /><Text style={styles.bitText}>{item.phone}</Text></View>
            )}
            {!!item.email && (
              <View style={styles.bit}><Feather name="mail" size={14} color="#666" /><Text style={styles.bitText}>{item.email}</Text></View>
            )}
          </View>
        </View>
        <View style={styles.iconActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => editContact(item)}>
            <Feather name="edit-2" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => deleteContact(item.id)}>
            <Feather name="trash" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top','bottom','left','right']}>
      <Text style={styles.title}>Trusted Contacts</Text>
      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts yet. Add someone you trust.</Text>}
      />
      <TouchableOpacity style={commonStyles.button} onPress={() => {
        setNameInput(''); setRelationInput(''); setPhoneInput(''); setEmailInput(''); setAddModalVisible(true);
      }}>
        <Text style={styles.buttonText}>Add New Contact</Text>
      </TouchableOpacity>

      {/* Add Contact Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Trusted Contact</Text>
            <TextInput placeholder="Name" placeholderTextColor="#999" value={nameInput} onChangeText={setNameInput} style={styles.input} />
            <TextInput placeholder="Relation" placeholderTextColor="#999" value={relationInput} onChangeText={setRelationInput} style={styles.input} />
            <TextInput placeholder="Contact Number" placeholderTextColor="#999" value={phoneInput} onChangeText={(t) => setPhoneInput(t.replace(/\D/g, '').slice(0, 10))} style={styles.input} keyboardType="number-pad" maxLength={10} />
            <TextInput placeholder="Email (optional)" placeholderTextColor="#999" value={emailInput} onChangeText={setEmailInput} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.saveBtn} onPress={saveContact}><Text style={styles.saveBtnText}>Save Contact</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Contact</Text>
            <TextInput placeholder="Name" placeholderTextColor="#999" value={nameInput} onChangeText={setNameInput} style={styles.input} />
            <TextInput placeholder="Relation" placeholderTextColor="#999" value={relationInput} onChangeText={setRelationInput} style={styles.input} />
            <TextInput placeholder="Contact Number" placeholderTextColor="#999" value={phoneInput} onChangeText={(t) => setPhoneInput(t.replace(/\D/g, '').slice(0, 10))} style={styles.input} keyboardType="number-pad" maxLength={10} />
            <TextInput placeholder="Email (optional)" placeholderTextColor="#999" value={emailInput} onChangeText={setEmailInput} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.saveBtn} onPress={saveContact}><Text style={styles.saveBtnText}>Update Contact</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditModalVisible(false); setCurrentContact(null); setNameInput(''); setRelationInput(''); setPhoneInput(''); setEmailInput(''); }}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Test SOS Modal */}
      <Modal visible={testSOSModalVisible} transparent animationType="fade" onRequestClose={() => setTestSOSModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Test SOS Alert</Text>
            <Text style={styles.modalText}>This will send a test SOS message to {currentContact?.name}. This is only a test and will not trigger a real emergency response.</Text>
            <TouchableOpacity style={styles.sosTestBtn} onPress={sendTestSOS}><Text style={styles.saveBtnText}>Send Test SOS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setTestSOSModalVisible(false); setCurrentContact(null); }}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20, alignSelf: 'center' },
  list: { flex: 1, width: '100%', marginBottom: 20 },
  contactItem: { ...commonStyles.card, marginVertical: 8, flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarLetter: { color: '#fff', fontWeight: '700', fontSize: 16 },
  contactContent: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 },
  chipText: { color: '#666', fontSize: 12, fontWeight: '600' },
  testSOSChip: { borderWidth: 1.5, borderColor: theme.colors.accent, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  testSOSText: { color: theme.colors.accent, fontSize: 12, fontWeight: '700' },
  bitsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bit: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2f7', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 },
  bitText: { marginLeft: 6, color: '#667085', fontSize: 12, fontWeight: '600' },
  iconActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  iconBtn: { padding: 6, marginLeft: 8, borderRadius: 999 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.accent, marginBottom: 12 },
  modalText: { fontSize: 16, color: '#555', marginBottom: 16, lineHeight: 22 },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10, color: '#222' },
  saveBtn: { ...commonStyles.button, marginTop: 6 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 10, alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  sosTestBtn: { ...commonStyles.button },
});

export default ContactsScreen;