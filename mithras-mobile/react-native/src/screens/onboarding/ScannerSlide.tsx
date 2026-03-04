import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { scanAddresses, truncAddress } from '../../services/hdWallet';
import { useConnectivity } from '../../context/Connectivity';

type ScannedItem = { index: number; address: string };

type Props = {
  onScan?: () => void;
  onDone?: () => void;
};

const ScannerScreen: React.FC<Props> = ({ onDone }) => {
  const [scanning, setScanning] = React.useState(false);
  const [current, setCurrent] = React.useState<ScannedItem | null>(null);
  const [found, setFound] = React.useState<string[] | null>(null);

  const { isConnected } = useConnectivity();

  const startScan = async () => {
    if (!isConnected) return;
    setScanning(true);
    setFound(null);
    try {
      const results = await scanAddresses((index, address) => {
        setCurrent({ index, address });
      });
      setFound(results);
      console.log('scanAddresses result:', results);
      // End of onboarding: navigate to home
      if (onDone) onDone();
    } catch (e) {
      console.warn('scanAddresses failed:', e);
      setFound([]);
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      {!scanning ? (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={startScan}
          activeOpacity={0.85}
        >
          <Text style={styles.scanButtonText}>Start Scan</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.scanListCompact}>
          <Text style={styles.scanTitle}>Scanning addresses...</Text>
          <View style={styles.currentBox}>
            <Text style={styles.currentIndex}>{current ? current.index : '—'}</Text>
            <Text style={styles.currentAddress}>{current ? truncAddress(current.address) : 'Waiting...'}</Text>
          </View>
        </View>
      )}
      {found && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.message}>Found {found.length} addresses</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  scanList: {
    width: '100%',
    alignItems: 'center',
  },
  scanItem: {
    color: '#EDE7FF',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    width: '100%',
    paddingHorizontal: 12,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  indexBadge: {
    minWidth: 40,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124,77,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.36)',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  indexText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scanItemText: {
    color: '#9BE2FF',
    fontWeight: '700',
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.6,
  },
  scanListCompact: {
    width: '100%',
    alignItems: 'center',
  },
  scanTitle: {
    color: '#C9B8FF',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '700',
  },
  currentBox: {
    width: '100%',
    backgroundColor: 'rgba(46,0,102,0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  currentIndex: {
    color: '#EDE7FF',
    fontWeight: '800',
    marginBottom: 6,
  },
  currentAddress: {
    color: '#9BE2FF',
    fontWeight: '800',
    fontSize: 16,
    textShadowColor: '#7C4DFF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
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
