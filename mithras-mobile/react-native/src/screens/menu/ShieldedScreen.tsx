import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import AddressCard from '../../components/AddressCard';
import { getShieldedAddressEntries, addShieldedAddr } from '../../services/shWallet';
import { truncAddress } from '../../services/hdWallet';
import { AckAlert } from '../../components/Alert';
import { getShieldedBalanceByReceiverIndexMicroAlgos } from '../../services/utxoStore';
import { scanShieldedUtxos } from '../../services/shieldedScanner';
import { refreshMerkleRoot } from '../../blockchain/transactions';
import { getAlgorandClient } from '../../blockchain/network';
import { storage } from '../../services/storage';

type ShieldedScreenProps = {
  confirm?: { visible: boolean; index: number | null; target?: 'public' | 'shielded' };
  setConfirm?: (c: { visible: boolean; index: number | null; target?: 'public' | 'shielded' }) => void;
};

export function ShieldedScreen({ confirm, setConfirm }: ShieldedScreenProps) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Array<{ index: number; address: string; balance?: number | string }>>([]);
  const [alert, setAlert] = React.useState<{ visible: boolean; title?: string; message: string }>({ visible: false, title: undefined, message: '' });
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshStatus, setRefreshStatus] = React.useState<{ lastScannedRound: number; currentRound?: number } | null>(null);

  const parseRound = (v: any): number | undefined => {
    if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? Math.floor(v) : undefined;
    if (typeof v === 'string') {
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
    }
    if (typeof v === 'bigint') {
      if (v < 0n) return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
    }
    const maybeUint = v?.uint ?? v?.['uint'];
    if (maybeUint !== undefined) return parseRound(maybeUint);
    return undefined;
  };

  const refreshLocalBalances = React.useCallback(() => {
    const byIndex = getShieldedBalanceByReceiverIndexMicroAlgos();
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        balance: (byIndex.get(it.index) ?? 0n).toString(),
      })),
    );
  }, []);

  const doRefresh = React.useCallback(
    async ({ showAlert }: { showAlert: boolean }) => {
      if (refreshing) return;
      setRefreshing(true);

      // Show incremental-scan status while refreshing.
      const lastRaw = storage.getString('shielded:lastScannedRound');
      const lastScannedRound = parseRound(lastRaw) ?? 0;
      setRefreshStatus({ lastScannedRound, currentRound: undefined });

      // Fetch current chain round (best-effort).
      try {
        const algorandClient = await getAlgorandClient();
        const status = await algorandClient.client.algod.status().do();
        const currentRound =
          parseRound((status as any)?.['last-round']) ??
          parseRound((status as any)?.lastRound) ??
          parseRound((status as any)?.['lastRound']);
        if (typeof currentRound === 'number') {
          setRefreshStatus((prev) => (prev ? { ...prev, currentRound } : prev));
        }
      } catch {
        // ignore
      }

      try {
        // Merkle sync is what unblocks spends. Keep attempts low here to avoid a long UI hang;
        // spend itself will retry more.
        try {
          await refreshMerkleRoot({ maxAttempts: 3, baseDelayMs: 350 });
        } catch {
          // Ignore merkle sync errors here; the scan itself can still succeed.
        }

        const res = await scanShieldedUtxos();
        refreshLocalBalances();

        const message = `Scanned ${res.scannedTxns} txns; decrypted ${res.decryptedNotes}.`;
        console.log(`[shielded] Refresh/Scan complete (alert=${showAlert})`, message);

        if (showAlert) setAlert({ visible: true, title: 'Scan complete', message });
      } catch (e) {
        console.warn('Shielded scan failed', e);
        if (showAlert) {
          setAlert({ visible: true, title: 'Scan failed', message: String(e) });
        }
      } finally {
        setRefreshing(false);
        setRefreshStatus(null);
      }
    },
    [refreshLocalBalances, refreshing],
  );

  const onRefresh = React.useCallback(async () => doRefresh({ showAlert: true }), [doRefresh]);
  const onPostSpendRefresh = React.useCallback(async () => doRefresh({ showAlert: false }), [doRefresh]);

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Pressable
          style={[styles.refreshButton, refreshing ? styles.refreshButtonDisabled : null]}
          disabled={refreshing}
          onPress={onRefresh}
        >
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
        </Pressable>

        {refreshing && refreshStatus ? (
          <View style={styles.refreshStatusRow}>
            <ActivityIndicator size="small" color="#EDE7FF" />
            <Text style={styles.refreshStatusText}>
              last scanned: {refreshStatus.lastScannedRound}  ·  current: {refreshStatus.currentRound ?? '…'}
            </Text>
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyCard} />
        ) : (
          items.map((it) => (
            <AddressCard
              key={it.address}
              address={it.address}
              shieldedIndex={it.index}
              balance={it.balance}
              onAfterSpend={onPostSpendRefresh}
            />
          ))
        )}
      </ScrollView>

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
  scroll: {
    flex: 1,
    width: '100%',
  },
  container: {
    marginTop: 18,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 24,
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
  refreshStatusRow: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  refreshStatusText: {
    color: 'rgba(237,231,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
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
