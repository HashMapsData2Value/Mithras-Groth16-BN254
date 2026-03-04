import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Modal, TextInput, Button } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { truncAddress } from '../services/hdWallet';
import { getBalanceForAddress } from '../blockchain/network';
import { getShieldedAddressEntries } from '../services/shWallet';
import { depositToShieldedPool } from '../blockchain/transactions';

type Props = {
  address: string;
  publicIndex?: number;
  balance?: number | string;
};

export default function AddressCard({ address, publicIndex, balance }: Props) {
  const [copied, setCopied] = React.useState(false);
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');
  const [bal, setBal] = React.useState<number | string | undefined>(balance);
  const [busy, setBusy] = React.useState(false);

  const onCopy = () => {
    try {
      Clipboard.setString(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
      Alert.alert('Copy failed', String(err));
    }
  };

  const onPress = () => {
    if (typeof publicIndex !== 'number') return;
    // quick tap opens deposit modal
    setDepositAmount('');
    setDepositOpen(true);
  };

  const formatBalance = (b?: number | string) => {
    if (b === undefined || b === null) return '-';
    if (typeof b === 'number') {
      if (!isFinite(b)) return '-';
      const algo = b / 1_000_000;
      return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }

    // bigint-safe formatting for microAlgos encoded as a decimal string
    const s = b.trim();
    if (!/^\d+$/.test(s)) {
      const n = Number(s);
      if (!isFinite(n)) return '-';
      const algo = n / 1_000_000;
      return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }

    try {
      const micro = BigInt(s);
      const whole = micro / 1_000_000n;
      const frac = micro % 1_000_000n;
      const fracStr = frac.toString().padStart(6, '0').replace(/0+$/, '');
      return fracStr.length ? `${whole.toString()}.${fracStr}` : whole.toString();
    } catch {
      return '-';
    }
  };

  const onConfirmDeposit = () => {
    // legacy single-mode handler kept for compatibility — not used now
    const amt = Number(depositAmount);
    if (!isFinite(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount in ALGO');
      return;
    }
    const micro = Math.round(amt * 1_000_000);
    console.log(`Deposit request: address=${address} amountALGO=${amt} micro=${micro}`);
    Alert.alert('Deposit', `Depositing ${amt} ALGO (${micro} µA) to shielded pool.`);
    setDepositOpen(false);
  };

  // Poll balance for public Algorand addresses periodically to avoid reloading the whole list.
  // Shielded addresses are bech32 "mith..." and do not have an on-chain account balance.
  React.useEffect(() => {
    let mounted = true;
    const loadingRef = { current: false } as { current: boolean };

    if (address.startsWith('mith')) {
      setBal(balance);
      return () => {
        mounted = false;
      };
    }

    async function loadBalance() {
      if (!mounted) return;
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const n = await getBalanceForAddress(address);
        if (mounted) setBal(n);
      } catch (e) {
        console.warn('AddressCard balance load error', e);
      } finally {
        loadingRef.current = false;
      }
    }

    // initial fetch and interval
    loadBalance();
    const id = setInterval(loadBalance, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [address, balance]);

  return (
    <>
      <Pressable style={styles.card} onLongPress={onCopy} onPress={onPress} accessibilityLabel="Address card">
        <View style={styles.left}>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {truncAddress(address)}
          </Text>
          {copied ? <Text style={styles.copiedText}>Copied</Text> : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.balance}>{formatBalance(bal)} ALGO</Text>
        </View>
      </Pressable>

      <AddressCardModal
        visible={depositOpen}
        onClose={() => {
          if (busy) return;
          setDepositOpen(false);
        }}
        publicIndex={publicIndex}
        onConfirm={({ action, amountALGO, to, toShieldedIndex }) => {
          const micro = Math.round(amountALGO * 1_000_000);
          if (action === 'deposit') {
            if (typeof publicIndex !== 'number') {
              Alert.alert('Missing signer', 'This address is missing a derivation index.');
              return;
            }

            setDepositOpen(false);
            setBusy(true);

            (async () => {
              try {
                console.log(
                  `Deposit request: fromIndex=${publicIndex} amountALGO=${amountALGO} micro=${micro} toShieldedIndex=${toShieldedIndex}`,
                );

                const res = await depositToShieldedPool({
                  fromIndex: publicIndex,
                  toShieldedIndex,
                  amountMicroAlgos: BigInt(micro),
                });

                const txIds = Array.isArray(res?.txIds) ? res.txIds.join(', ') : '(unknown)';
                Alert.alert('Deposit submitted', `TxIDs: ${txIds}`);
              } catch (e) {
                console.warn('Deposit failed', e);
                Alert.alert('Deposit failed', String(e));
              } finally {
                setBusy(false);
              }
            })();
          } else {
            console.log(`Transfer request: from=${address} to=${to} amountALGO=${amountALGO} micro=${micro}`);
            Alert.alert('Transfer', `Transferring ${amountALGO} ALGO (${micro} µA) to ${to}`);
          }
          if (action !== 'deposit') setDepositOpen(false);
        }}
        balance={bal}
        amount={depositAmount}
        setAmount={setDepositAmount}
      />
    </>
  );
}

// Render modal at end of file
export function AddressCardModal({
  visible,
  onClose,
  publicIndex,
  onConfirm,
  balance,
  amount,
  setAmount,
}: {
  visible: boolean;
  onClose: () => void;
  publicIndex?: number;
  onConfirm: (payload: { action: 'deposit' | 'transfer'; amountALGO: number; to?: string; toShieldedIndex?: number }) => void;
  balance?: number | string;
  amount: string;
  setAmount: (s: string) => void;
}) {
  const [action, setAction] = React.useState<'deposit' | 'transfer' | null>(null);
  const [toAddress, setToAddress] = React.useState('');
  const [shieldedEntries, setShieldedEntries] = React.useState<Array<{ index: number; address: string }>>([]);
  const [shieldedLoading, setShieldedLoading] = React.useState(false);
  const [shieldedOpen, setShieldedOpen] = React.useState(false);
  const [selectedShieldedIndex, setSelectedShieldedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadShielded() {
      if (!visible) return;
      if (action !== 'deposit') return;
      setShieldedLoading(true);
      try {
        const entries = await getShieldedAddressEntries();
        if (!mounted) return;
        setShieldedEntries(entries);
        if (entries.length > 0) {
          setSelectedShieldedIndex((prev) => (prev === null ? entries[0].index : prev));
        } else {
          setSelectedShieldedIndex(null);
        }
      } catch (e) {
        console.warn('Failed to load shielded addresses', e);
        if (mounted) {
          setShieldedEntries([]);
          setSelectedShieldedIndex(null);
        }
      } finally {
        if (mounted) setShieldedLoading(false);
      }
    }

    loadShielded();
    return () => {
      mounted = false;
    };
  }, [visible, action]);

  const formatBalance = (b?: number | string) => {
    if (b === undefined || b === null) return '-';
    const n = typeof b === 'string' ? Number(b) : b;
    if (!isFinite(n)) return '-';
    const algo = n / 1_000_000;
    return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const computeMaxString = () => {
    const raw = typeof balance === 'string' ? Number(balance) : balance;
    if (typeof raw !== 'number' || !isFinite(raw)) return '';
    const algo = raw / 1_000_000;
    const max = Math.max(0, algo - 0.2);
    return Number(max.toFixed(6)).toString();
  };

  const useMax = () => {
    setAmount(computeMaxString());
  };

  const handleConfirm = () => {
    const n = Number(amount);
    if (!isFinite(n) || n <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount in ALGO');
      return;
    }
    if (action === 'transfer' && !toAddress) {
      Alert.alert('Missing address', 'Please enter a recipient Algorand address');
      return;
    }

    if ((action ?? 'deposit') === 'deposit') {
      if (shieldedLoading) {
        Alert.alert('Please wait', 'Loading shielded addresses...');
        return;
      }
      if (shieldedEntries.length === 0 || selectedShieldedIndex === null) {
        Alert.alert(
          'No shielded addresses',
          'Create a shielded address first (Shielded Addresses tab), then try depositing again.',
        );
        return;
      }
    }

    onConfirm({
      action: action ?? 'deposit',
      amountALGO: n,
      to: action === 'transfer' ? toAddress : undefined,
      toShieldedIndex: (action ?? 'deposit') === 'deposit' ? (selectedShieldedIndex ?? undefined) : undefined,
    });
  };

  const selectedShielded = shieldedEntries.find((e) => e.index === selectedShieldedIndex);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {!action ? (
            <>
              <Text style={styles.modalTitle}>Choose action</Text>
              <View style={styles.actionsRow}>
                <Pressable style={styles.actionCard} onPress={() => setAction('transfer')}>
                  <Text style={styles.actionCardTitle}>Transfer</Text>
                  <Text style={styles.actionCardSubtitle}>Send ALGO to a public address</Text>
                </Pressable>
                <Pressable style={styles.actionCard} onPress={() => setAction('deposit')}>
                  <Text style={styles.actionCardTitle}>Deposit</Text>
                  <Text style={styles.actionCardSubtitle}>Deposit into shielded pool</Text>
                </Pressable>
              </View>
              <Pressable onPress={onClose} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={() => setAction(null)} style={styles.backRow}>
                <Text style={styles.backText}>← Change action</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{action === 'deposit' ? 'Deposit funds into shielded pool?' : 'Transfer to public address?'}</Text>
              <Text style={styles.modalSubtitle}>Current balance: {formatBalance(balance)} ALGO</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="Amount (ALGO)"
                placeholderTextColor="#C9B8FF"
                value={amount}
                onChangeText={setAmount}
              />
              {action === 'deposit' ? (
                <>
                  <Text style={styles.modalSubtitle}>Destination shielded address</Text>
                  <Pressable
                    style={styles.dropdownRow}
                    onPress={() => setShieldedOpen((v) => !v)}
                    disabled={shieldedLoading || shieldedEntries.length === 0}
                  >
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {shieldedLoading
                        ? 'Loading...'
                        : selectedShielded
                          ? `m/44'/283'/{1,2}/0/${selectedShielded.index}  •  ${truncAddress(selectedShielded.address)}`
                          : shieldedEntries.length === 0
                            ? 'No shielded addresses'
                            : 'Select a shielded address'}
                    </Text>
                  </Pressable>
                  {shieldedOpen && shieldedEntries.length > 0 ? (
                    <View style={styles.dropdownList}>
                      {shieldedEntries.map((e) => (
                        <Pressable
                          key={e.index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedShieldedIndex(e.index);
                            setShieldedOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText} numberOfLines={1}>
                            {`m/44'/283'/{1,2}/0/${e.index}  •  ${truncAddress(e.address)}`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}
              {action === 'transfer' ? (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Recipient Algorand address"
                  placeholderTextColor="#C9B8FF"
                  value={toAddress}
                  onChangeText={setToAddress}
                />
              ) : null}
              <View style={styles.modalButtonsRow}>
                <Pressable style={styles.modalButton} onPress={useMax}>
                  <Text style={styles.modalButtonText}>Use Max</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirm}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Deposit modal UI below AddressCard component in same file


const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 420,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    color: '#EDE7FF',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balance: {
    color: '#C9B8FF',
    fontSize: 13,
    fontWeight: '500',
  },
  copiedText: {
    color: '#00C853',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '600',
  },
  copyText: {
    color: '#EDE7FF',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1B1B1F',
    borderRadius: 12,
    padding: 18,
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
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#EDE7FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
  },
  dropdownRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
  },
  dropdownText: {
    color: '#EDE7FF',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownList: {
    marginTop: -6,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dropdownItemText: {
    color: '#C9B8FF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionsRow: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  actionCardTitle: {
    color: '#EDE7FF',
    fontWeight: '700',
    fontSize: 16,
  },
  actionCardSubtitle: {
    color: '#C9B8FF',
    fontSize: 13,
  },
  modalClose: {
    marginTop: 12,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#C9B8FF',
  },
  backRow: {
    marginBottom: 8,
  },
  backText: {
    color: '#C9B8FF',
    fontSize: 13,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#00C853',
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  modalButtonText: {
    color: '#EDE7FF',
    fontWeight: '700',
  },
});
