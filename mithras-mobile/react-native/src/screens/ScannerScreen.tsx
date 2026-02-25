import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onScan?: () => void;
};

const ScannerScreen: React.FC<Props> = ({ onScan }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner</Text>
      <Text style={styles.message}>Scanner placeholder — implement address discovery here.</Text>
      <TouchableOpacity style={styles.scanButton} onPress={onScan} activeOpacity={0.85}>
        <Text style={styles.scanButtonText}>Start Scan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7C4DFF',
    marginBottom: 8,
  },
  message: {
    color: '#C9B8FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(0,200,83,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.30)',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

export default ScannerScreen;
