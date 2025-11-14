import { Linking } from 'react-native';
import { getToken } from './auth';

const BASE_URL = 'https://safeher-101e.onrender.com';

export async function sendCheckInEmail(contacts, message, locationUrl = '') {
  try {
    const emails = contacts.filter(c => !!c.email).map(c => c.email.trim());
    if (emails.length === 0) return false;
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/alerts/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ recipients: emails, message, locationUrl }),
    });
    if (res.ok) return true;
  } catch (e) {}

  // Fallback to mailto links if backend not available
  try {
    const subject = 'SafeHer Check-In Missed';
    const body = `${message}${locationUrl ? `\nLocation: ${locationUrl}` : ''}`;
    for (const c of contacts) {
      if (!c.email) continue;
      const url = `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      try { await Linking.openURL(url); } catch {}
    }
    return false;
  } catch {}
  return false;
}