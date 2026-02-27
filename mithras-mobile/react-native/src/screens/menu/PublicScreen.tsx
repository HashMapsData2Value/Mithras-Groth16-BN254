import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AddressCard from '../../components/AddressCard';
import { getPublicAddressesAndBalances } from '../../blockchain/network';

export function PublicScreen() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Array<{ address: string; balance?: number | string }>>([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getPublicAddressesAndBalances();
        if (mounted) setItems(res ?? []);
      } catch (err) {
        console.warn('PublicScreen load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    // blank shape placeholder while loading
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyCard} />
      ) : (
        items.map(it => <AddressCard key={it.address} address={it.address} balance={it.balance} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  placeholder: {
    marginTop: 18,
    width: '100%',
    maxWidth: 420,
    height: 220,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  emptyCard: {
    width: '100%',
    maxWidth: 420,
    height: 220,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  }
});

export default PublicScreen;
