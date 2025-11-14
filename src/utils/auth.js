import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const CURRENT_USER_KEY = 'safeher_current_user';
const TOKEN_KEY = 'safeher_token';
// Hard-set public backend URL for production/shared networks
const BASE_URL = 'https://safeher-101e.onrender.com';

/*
// Previous auto-derivation logic (disabled while using public Render URL)
const apiUrlFromConfig =
  (Constants?.expoConfig?.extra?.API_URL) ||
  (Constants?.manifest?.extra?.API_URL) ||
  (process?.env?.EXPO_PUBLIC_API_URL);

// Derive host from Expo dev server when running in Expo Go
const hostUri =
  (Constants?.expoConfig?.hostUri) ||
  (Constants?.manifest?.debuggerHost) ||
  (Constants?.manifest2?.extra?.expoClient?.hostUri);
const hostFromExpo = hostUri ? hostUri.split(':')[0] : null;

const BASE_URL = apiUrlFromConfig
  ? apiUrlFromConfig
  : (Platform.OS !== 'web' && hostFromExpo)
  ? `http://${hostFromExpo}:5000`
  : Platform.OS === 'android'
  ? 'http://10.0.2.2:5000'
  : 'http://localhost:5000';
*/

// Debug: log the resolved BASE_URL so we can verify connectivity targets
console.log('[Auth] BASE_URL ->', BASE_URL);

async function storeSession(user, token) {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function register({ name, email, password }) {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || 'Registration failed' };
    }
    const data = await res.json();
    await storeSession(data.user, data.token);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: `Network error: ${e?.message || e}` };
  }
}

export async function login({ email, password }) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || 'Login failed' };
    }
    const data = await res.json();
    await storeSession(data.user, data.token);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: `Network error: ${e?.message || e}` };
  }
}

export async function logout() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}