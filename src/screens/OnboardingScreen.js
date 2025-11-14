import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, commonStyles } from '../utils/theme';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={[commonStyles.container, styles.center]}>
      <View style={commonStyles.centerContent}>
        <Text style={styles.title}>Welcome to SafeHer</Text>
        <Text style={styles.description}>
          Your personal safety companion designed to keep you protected at all times.
        </Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>• Quick SOS alerts</Text>
          <Text style={styles.featureText}>• Location sharing</Text>
          <Text style={styles.featureText}>• Emergency contacts</Text>
          <Text style={styles.featureText}>• Safety resources</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[commonStyles.button, styles.button]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[commonStyles.button, styles.button]} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default OnboardingScreen;