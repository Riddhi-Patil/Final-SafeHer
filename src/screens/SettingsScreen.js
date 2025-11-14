import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, commonStyles } from '../utils/theme';
import { logout, getCurrentUser } from '../utils/auth';

const SettingsScreen = ({ navigation }) => {
  return (
    <View style={commonStyles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Enable Location Sharing</Text>
        <Switch value={true} />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch value={true} />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch value={false} />
      </View>
      
      <TouchableOpacity 
        style={[commonStyles.button, styles.logoutBtn]} 
        onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 30,
    alignSelf: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  logoutBtn: { marginTop: 24 },
  logoutText: { color: '#fff', fontWeight: '700' }
});

export default SettingsScreen;