import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../utils/theme';

const MapScreen = () => {
  const insets = useSafeAreaInsets();
  const region = {
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You" />
      </MapView>
      <View style={[styles.overlayCard, { top: insets.top + 16 }]}>
        <Text style={styles.title}>Routes & Safety Map</Text>
        <Text style={styles.subtitle}>Heatmap and safer routes coming soon.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlayCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  subtitle: {
    marginTop: 4,
    color: '#555',
  },
});

export default MapScreen;