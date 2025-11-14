import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, commonStyles } from '../utils/theme';

const HISTORY_KEY = 'sosHistory';

const HistoryScreen = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        if (stored) setEvents(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>SOS Event</Text>
      <Text style={styles.meta}>Time: {new Date(item.timestamp).toLocaleString()}</Text>
      {item.location && (
        <Text style={styles.meta}>Location: {item.location?.lat?.toFixed(4)}, {item.location?.lon?.toFixed(4)}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>History & Evidence</Text>
      <FlatList
        data={events}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No events yet.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.accent,
    alignSelf: 'center',
    marginBottom: 16,
  },
  card: {
    ...commonStyles.card,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  meta: { color: '#666', marginTop: 6 },
  empty: { textAlign: 'center', color: '#777' },
});

export default HistoryScreen;