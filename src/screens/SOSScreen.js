import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, commonStyles } from '../utils/theme';

const SOSScreen = ({ navigation }) => {
  const [countdown, setCountdown] = useState(5);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !alertSent) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !alertSent) {
      setAlertSent(true);
    }
  }, [countdown, alertSent]);

  const cancelAlert = () => {
    navigation.goBack();
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      {!alertSent ? (
        <>
          <Text style={styles.title}>SOS Alert</Text>
          <Text style={styles.countdown}>
            Sending alert in {countdown} seconds
          </Text>
          <Text style={styles.description}>
            Your emergency contacts will be notified with your current location
          </Text>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={cancelAlert}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Alert Sent!</Text>
          <Text style={styles.description}>
            Your emergency contacts have been notified with your current location
          </Text>
          
          <TouchableOpacity 
            style={commonStyles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  countdown: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  cancelText: {
    color: theme.colors.error,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SOSScreen;