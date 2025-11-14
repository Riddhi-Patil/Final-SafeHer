import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme, commonStyles } from '../utils/theme';
import { getCurrentUser } from '../utils/auth';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Quick gate: if logged in, go to Main; else Onboarding
    const timer = setTimeout(async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          navigation.replace('Main');
        } else {
          navigation.replace('Onboarding');
        }
      } catch {
        navigation.replace('Onboarding');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[commonStyles.container, commonStyles.centerContent]}>
      <Text style={styles.logo}>SafeHer</Text>
      <Text style={styles.tagline}>Because Feeling Safe Shouldn't Be a Privilege</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.accent,
  }
});

export default SplashScreen;