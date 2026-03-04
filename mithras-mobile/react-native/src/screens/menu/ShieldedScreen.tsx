import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal } from 'react-native';
import AddressCard from '../../components/AddressCard';
import { getShieldedAddressEntries, addShieldedAddr } from '../../services/shWallet';
import { truncAddress } from '../../services/hdWallet';
import { AckAlert } from '../../components/Alert';
import { getShieldedBalanceByReceiverIndexMicroAlgos } from '../../services/utxoStore';
import { scanShieldedUtxos } from '../../services/shieldedScanner';

type ShieldedScreenProps = {
  confirm?: { visible: boolean; index: number | null; target?: 'public' | 'shielded' };
  setConfirm?: (c: { visible: boolean; index: number | null; target?: 'public' | 'shielded' }) => void;
};

export function ShieldedScreen({ confirm, setConfirm }: ShieldedScreenProps) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Array<{ index: number; address: string; balance?: number | string }>>([]);
  const [alert, setAlert] = React.useState<{ visible: boolean; title?: string; message: string }>({ visible: false, title: undefined, message: '' });
  const [refreshing, setRefreshing] = React.useState(false);

  const refreshLocalBalances = React.useCallback(() => {
    const byIndex = getShieldedBalanceByReceiverIndexMicroAlgos();
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        balance: (byIndex.get(it.index) ?? 0n).toString(),
      })),
    );
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const entries = await getShieldedAddressEntries();
        if (!mounted) return;
        const byIndex = getShieldedBalanceByReceiverIndexMicroAlgos();
        setItems(entries.map((e) => ({ index: e.index, address: e.address, balance: (byIndex.get(e.index) ?? 0n).toString() })) ?? []);
      } catch (err) {
        console.warn('ShieldedScreen load error', err);
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
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Pressable
          style={[styles.refreshButton, refreshing ? styles.refreshButtonDisabled : null]}
          disabled={refreshing}
          onPress={async () => {
            setRefreshing(true);
            try {
              const res = await scanShieldedUtxos();
              refreshLocalBalances();
              setAlert({
                visible: true,
                title: 'Scan complete',
                message: `Scanned ${res.scannedTxns} txns; decrypted ${res.decryptedNotes}; marked spent ${res.markedSpent}.`,
              });
            } catch (e) {
              console.warn('Shielded scan failed', e);
              setAlert({ visible: true, title: 'Scan failed', message: String(e) });
            } finally {
              setRefreshing(false);
            }
          }}
        >
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
        </Pressable>

        {items.length === 0 ? (
          <View style={styles.emptyCard} />
        ) : (
          items.map(it => <AddressCard key={it.address} address={it.address} balance={it.balance} />)
        )}
      </View>

      <AckAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onRequestClose={() => setAlert({ visible: false, message: '' })}
      />

      <Modal transparent visible={!!confirm?.visible && confirm?.target === 'shielded'} animationType="fade" onRequestClose={() => setConfirm && setConfirm({ visible: false, index: null, target: undefined })}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <Text style={modalStyles.modalTitle}>Add shielded address</Text>
            <Text style={modalStyles.modalSubtitle}>Do you wish to add another shielded address?</Text>
            <View style={modalStyles.actionsRow}>
              <Pressable style={modalStyles.actionCard} onPress={() => setConfirm && setConfirm({ visible: false, index: null, target: undefined })}>
                <Text style={modalStyles.actionCardTitle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={modalStyles.actionCard}
                onPress={async () => {
                  setConfirm && setConfirm({ visible: false, index: null, target: undefined });
                  try {
                    const res = await addShieldedAddr();
                    if (res && res.address) {
                      const entries = await getShieldedAddressEntries();
                      const byIndex = getShieldedBalanceByReceiverIndexMicroAlgos();
                      setItems(entries.map((e) => ({ index: e.index, address: e.address, balance: (byIndex.get(e.index) ?? 0n).toString() })));
                      setAlert({ visible: true, title: 'Shielded address added', message: `${truncAddress(res.address)} added` });
                    } else {
                      setAlert({ visible: true, title: 'Add failed', message: 'Unable to add shielded address' });
                    }
                  } catch (e) {
                    console.warn('Add shielded address error', e);
                    setAlert({ visible: true, title: 'Error', message: String(e) });
                  }
                }}
              >
                <Text style={modalStyles.actionCardTitle}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
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
  },
  refreshButton: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    color: '#EDE7FF',
    fontWeight: '700',
    fontSize: 14,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#1B1B1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  modalTitle: {
    color: '#EDE7FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#C9B8FF',
    marginBottom: 12,
  },
  actionsRow: {
    width: '100%',
    gap: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
    alignItems: 'center',
  },
  actionCardTitle: {
    color: '#EDE7FF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ShieldedScreen;
