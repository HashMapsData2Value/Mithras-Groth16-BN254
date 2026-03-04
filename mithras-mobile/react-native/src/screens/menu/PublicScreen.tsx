import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import AddressCard from '../../components/AddressCard';
import { getPublicAddressEntries, addNextAddress, truncAddress, getNextAddressIndex } from '../../services/hdWallet';
import { AckAlert } from '../../components/Alert';
import { Modal } from 'react-native';

type PublicScreenProps = {
  confirm?: { visible: boolean; index: number | null; target?: 'public' | 'shielded' };
  setConfirm?: (c: { visible: boolean; index: number | null; target?: 'public' | 'shielded' }) => void;
};

export function PublicScreen({ confirm, setConfirm }: PublicScreenProps) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Array<{ index: number; address: string; balance?: number | string }>>([]);
  const [alert, setAlert] = React.useState<{ visible: boolean; title?: string; message: string }>({ visible: false, title: undefined, message: '' });

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const addrs = await getPublicAddressEntries();
        if (!mounted) return;
        // items hold optional balances; keep balance undefined here
        setItems(addrs.map(a => ({ index: a.index, address: a.address })) ?? []);
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
    <View style={styles.root}>
      <View style={styles.container}>
        {items.length === 0 ? (
          <View style={styles.emptyCard} />
        ) : (
          items.map(it => <AddressCard key={it.address} address={it.address} publicIndex={it.index} balance={it.balance} />)
        )}
      </View>

      <AckAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onRequestClose={() => setAlert({ visible: false, message: '' })}
      />

      <Modal transparent visible={!!confirm?.visible && confirm?.target === 'public'} animationType="fade" onRequestClose={() => setConfirm && setConfirm({ visible: false, index: null, target: undefined })}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <Text style={modalStyles.modalTitle}>Add address</Text>
            <Text style={modalStyles.modalSubtitle}>
              {confirm?.index !== null && typeof confirm?.index === 'number'
                ? `Do you wish to add another address (m/44'/283'/0'/0/${confirm.index})?`
                : 'Do you wish to add another address?'}
            </Text>
            <View style={modalStyles.actionsRow}>
              <Pressable style={modalStyles.actionCard} onPress={() => setConfirm && setConfirm({ visible: false, index: null, target: undefined })}>
                <Text style={modalStyles.actionCardTitle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={modalStyles.actionCard}
                onPress={async () => {
                  setConfirm && setConfirm({ visible: false, index: null, target: undefined });
                  try {
                    const res = await addNextAddress();
                    if (res && res.address) {
                      const nextIndex = getNextAddressIndex() - 1;
                      setItems(prev => [...prev, { index: nextIndex, address: res.address }]);
                      setAlert({ visible: true, title: 'Address added', message: `${truncAddress(res.address)} added` });
                    } else {
                      setAlert({ visible: true, title: 'Add failed', message: 'Unable to add address' });
                    }
                  } catch (e) {
                    console.warn('Add address error', e);
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
  fabText: {
    color: '#081012',
    fontSize: 20,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  fabOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0eae4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20,
  }
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

export default PublicScreen;
