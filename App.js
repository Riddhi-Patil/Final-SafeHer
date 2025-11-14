import 'react-native-gesture-handler';
import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Lazy-load screens to avoid requiring native modules before runtime is ready
const SplashScreen = React.lazy(() => import('./src/screens/SplashScreen'));
const OnboardingScreen = React.lazy(() => import('./src/screens/OnboardingScreen'));
const LoginScreen = React.lazy(() => import('./src/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('./src/screens/RegisterScreen'));
const HomeScreen = React.lazy(() => import('./src/screens/HomeScreen'));
const MapScreen = React.lazy(() => import('./src/screens/MapScreen'));
const HistoryScreen = React.lazy(() => import('./src/screens/HistoryScreen'));
const LiveSOSModal = React.lazy(() => import('./src/screens/LiveSOSModal'));
const ContactsScreen = React.lazy(() => import('./src/screens/ContactsScreen'));
const SettingsScreen = React.lazy(() => import('./src/screens/SettingsScreen'));
const SOSScreen = React.lazy(() => import('./src/screens/SOSScreen'));
const IncomingCallScreen = React.lazy(() => import('./src/screens/IncomingCallScreen'));
const OutgoingCallScreen = React.lazy(() => import('./src/screens/OutgoingCallScreen'));
const CheckInScreen = React.lazy(() => import('./src/screens/CheckInScreen'));

// Theme configuration
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C4AE2',
    accent: '#FF5E8A',
    background: '#FFF5FA',
    text: '#321B5D',
    error: '#FF5E8A',
  }
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          height: 80,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: { fontSize: 12, paddingBottom: 0 },
        tabBarIcon: ({ color }) => {
          const map = {
            Home: 'home',
            Map: 'map',
            'Check-Ins': 'bell',
            Contacts: 'users',
            History: 'clock',
            Settings: 'settings',
          };
          const icon = map[route.name] || 'circle';
          return <Feather name={icon} size={26} color={color} style={{ marginTop: 2 }} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Check-Ins" component={CheckInScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Suspense fallback={null}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="SOS" component={SOSScreen} />
              <Stack.Screen name="LiveSOS" component={LiveSOSModal} options={{ presentation: 'modal' }} />
              <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} options={{ headerShown: false, presentation: 'modal' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </Suspense>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  floatingSOS: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sosBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  sosLabel: { color: '#fff', fontWeight: '700' }
});