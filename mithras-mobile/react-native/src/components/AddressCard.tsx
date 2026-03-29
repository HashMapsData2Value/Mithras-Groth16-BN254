import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Modal, TextInput, Button } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { truncAddress } from '../services/hdWallet';
import { getBalanceForAddress } from '../blockchain/network';
import { getShieldedAddressEntries } from '../services/shWallet';
import { depositToShieldedPool, spendFromShieldedPool, transferFromPublicAddress, withdrawFromShieldedPool } from '../blockchain/transactions';
import { getShieldedBalanceByReceiverIndexMicroAlgos, getUnspentUtxoRecords } from '../services/utxoStore';
import algosdk from 'algosdk';

type Props = {
  address: string;
  publicIndex?: number;
  shieldedIndex?: number;
  balance?: number | string;
  onAfterSpend?: () => void | Promise<void>;
};

export default function AddressCard({ address, publicIndex, shieldedIndex, balance, onAfterSpend }: Props) {
  const [copied, setCopied] = React.useState(false);
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');
  const [sendOpen, setSendOpen] = React.useState(false);
  const [sendAmount, setSendAmount] = React.useState('');
  const [sendTo, setSendTo] = React.useState('');
  const [bal, setBal] = React.useState<number | string | undefined>(balance);
  const [busy, setBusy] = React.useState(false);
  const [utxoExpanded, setUtxoExpanded] = React.useState(false);

  const longPressGuardRef = React.useRef(false);

  const isShielded = address.startsWith('mith');

  const utxosForThisShielded = React.useMemo(() => {
    if (!isShielded) return [];
    if (!utxoExpanded) return [];
    if (typeof shieldedIndex !== 'number') return [];

    const recs = getUnspentUtxoRecords().filter((r) => r.receiverShieldedIndex === shieldedIndex);
    // Show largest first (more relevant for single-input spends)
    recs.sort((a, b) => {
      let aa = 0n;
      let bb = 0n;
      try {
        aa = BigInt(a.amount);
      } catch {
        aa = 0n;
      }
      try {
        bb = BigInt(b.amount);
      } catch {
        bb = 0n;
      }
      return aa > bb ? -1 : aa < bb ? 1 : 0;
    });
    return recs;
  }, [isShielded, utxoExpanded, shieldedIndex, bal]);

  const truncUtxoId = (id: string) => {
    const s = String(id ?? '');
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}…${s.slice(-4)}`;
  };

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
    if (longPressGuardRef.current) return;
    if (isShielded) {
      if (busy) return;
      if (typeof shieldedIndex !== 'number') {
        Alert.alert('Missing shielded index', 'This shielded address is missing its derivation index.');
        return;
      }
      setSendTo('');
      setSendAmount('');
      setSendOpen(true);
      return;
    }

    if (typeof publicIndex !== 'number') return;
    // quick tap opens deposit modal
    setDepositAmount('');
    setDepositOpen(true);
  };

  const onLongPress = () => {
    longPressGuardRef.current = true;
    setTimeout(() => {
      longPressGuardRef.current = false;
    }, 250);

    // Long-press copies for both public and shielded cards.
    onCopy();
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
      <Pressable style={styles.card} onLongPress={onLongPress} onPress={onPress} accessibilityLabel="Address card">
        <View style={styles.left}>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {truncAddress(address)}
          </Text>

          {isShielded ? (
            <Pressable
              style={styles.utxoToggle}
              onPress={(e) => {
                (e as any)?.stopPropagation?.();
                setUtxoExpanded((v) => !v);
              }}
              onLongPress={(e) => {
                (e as any)?.stopPropagation?.();
              }}
              accessibilityLabel="Toggle UTXO list"
              hitSlop={8}
            >
              <Text style={styles.utxoToggleText}>{utxoExpanded ? 'v' : '>'}</Text>
            </Pressable>
          ) : null}

          {copied ? <Text style={styles.copiedText}>Copied</Text> : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.balance}>{formatBalance(bal)} ALGO</Text>
        </View>
      </Pressable>

      {isShielded && utxoExpanded ? (
        <View style={styles.utxoList}>
          {utxosForThisShielded.length === 0 ? (
            <View style={styles.utxoRow}>
              <Text style={styles.utxoRowText}>No unspent UTXOs</Text>
            </View>
          ) : (
            utxosForThisShielded.map((u) => (
              <View key={u.id} style={styles.utxoRow}>
                <Text style={styles.utxoRowText}>{formatBalance(u.amount)} ALGO</Text>
                <Text style={styles.utxoRowSubText}>{truncUtxoId(u.id)}</Text>
              </View>
            ))
          )}
        </View>
      ) : null}

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
            if (typeof publicIndex !== 'number') {
              Alert.alert('Missing signer', 'This address is missing a derivation index.');
              return;
            }
            const toAddr = String(to ?? '').trim();
            if (!toAddr) {
              Alert.alert('Missing address', 'Please enter a recipient Algorand address');
              return;
            }

            setDepositOpen(false);
            setBusy(true);

            (async () => {
              try {
                console.log(`Transfer request: fromIndex=${publicIndex} to=${toAddr} amountALGO=${amountALGO} micro=${micro}`);
                const res = await transferFromPublicAddress({
                  fromIndex: publicIndex,
                  toAddress: toAddr,
                  amountMicroAlgos: BigInt(micro),
                });

                // Refresh sender balance immediately after submit.
                try {
                  const n = await getBalanceForAddress(address);
                  setBal(n);
                } catch (e) {
                  console.warn('Transfer balance refresh failed', e);
                }

                // Also refresh once more shortly after to catch confirmation.
                setTimeout(() => {
                  getBalanceForAddress(address)
                    .then((n) => setBal(n))
                    .catch(() => undefined);
                }, 4000);

                const txIds = Array.isArray(res?.txIds) ? res.txIds.join(', ') : '(unknown)';
                Alert.alert('Transfer submitted', `TxIDs: ${txIds}`);
              } catch (e) {
                console.warn('Transfer failed', e);
                Alert.alert('Transfer failed', String(e));
              } finally {
                setBusy(false);
              }
            })();
          }
          if (action !== 'deposit') setDepositOpen(false);
        }}
        balance={bal}
        amount={depositAmount}
        setAmount={setDepositAmount}
      />

      <ShieldedSendModal
        visible={sendOpen}
        onClose={() => {
          if (busy) return;
          setSendOpen(false);
        }}
        fromShieldedIndex={shieldedIndex}
        balance={bal}
        amount={sendAmount}
        setAmount={setSendAmount}
        toAddress={sendTo}
        setToAddress={setSendTo}
        onConfirm={async ({ action, to, amountALGO }) => {
          if (typeof shieldedIndex !== 'number') {
            Alert.alert('Missing signer', 'This shielded address is missing a derivation index.');
            return;
          }

          setSendOpen(false);
          setBusy(true);

          try {
            if (action === 'spend') {
              const micro = Math.round(amountALGO * 1_000_000);
              const res = await spendFromShieldedPool({
                fromShieldedIndex: shieldedIndex,
                toShieldedAddress: to,
                amountMicroAlgos: BigInt(micro),
              });

              const txIds = Array.isArray(res?.txIds) ? res.txIds.join(', ') : '(unknown)';
              Alert.alert('Spend submitted', `TxIDs: ${txIds}`);
            } else {
              const res = await withdrawFromShieldedPool({
                fromShieldedIndex: shieldedIndex,
                toPublicAddress: to,
              });
              const txIds = Array.isArray(res?.txIds) ? res.txIds.join(', ') : '(unknown)';
              Alert.alert('Withdraw submitted', `TxIDs: ${txIds}`);
            }

            // Update the displayed balance based on local UTXO store.
            const byIndex = getShieldedBalanceByReceiverIndexMicroAlgos();
            setBal((byIndex.get(shieldedIndex) ?? 0n).toString());

            try {
              await onAfterSpend?.();
            } catch (err) {
              console.warn('Post-send refresh failed', err);
            }
          } catch (e) {
            console.warn('Shielded action failed', e);
            Alert.alert('Action failed', String(e));
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

export function ShieldedSendModal({
  visible,
  onClose,
  fromShieldedIndex,
  balance,
  amount,
  setAmount,
  toAddress,
  setToAddress,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  fromShieldedIndex?: number;
  balance?: number | string;
  amount: string;
  setAmount: (s: string) => void;
  toAddress: string;
  setToAddress: (s: string) => void;
  onConfirm: (payload: { action: 'spend' | 'withdraw'; to: string; amountALGO: number }) => void | Promise<void>;
}) {
  const [action, setAction] = React.useState<'spend' | 'withdraw'>('spend');

  const hasUnspentUtxo = React.useMemo(() => {
    if (typeof fromShieldedIndex !== 'number') return false;
    try {
      return getUnspentUtxoRecords().some((r) => {
        if (r.receiverShieldedIndex !== fromShieldedIndex) return false;
        try {
          return BigInt(r.amount) > 0n;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }, [fromShieldedIndex, visible, balance]);

  React.useEffect(() => {
    if (!visible) return;
    setAction('spend');
  }, [visible]);

  const formatBalance = (b?: number | string) => {
    if (b === undefined || b === null) return '-';
    if (typeof b === 'number') {
      if (!isFinite(b)) return '-';
      const algo = b / 1_000_000;
      return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }

    const s = b.trim();
    if (!/^(\d+)$/.test(s)) {
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

  const handleConfirm = () => {
    if (typeof fromShieldedIndex !== 'number') {
      Alert.alert('Missing shielded index', 'This shielded address is missing its derivation index.');
      return;
    }

    if (action === 'withdraw' && !hasUnspentUtxo) {
      Alert.alert('No notes available', 'No unspent shielded notes (UTXOs) are available to withdraw.');
      return;
    }

    const to = toAddress.trim();
    if (!to) {
      Alert.alert('Missing address', 'Please enter a recipient address');
      return;
    }

    if (action === 'spend') {
      const n = Number(amount);
      if (!isFinite(n) || n <= 0) {
        Alert.alert('Invalid amount', 'Please enter a valid amount in ALGO');
        return;
      }
      if (!to.startsWith('mith')) {
        Alert.alert('Invalid address', 'Recipient must be a shielded address (mith...)');
        return;
      }
      onConfirm({ action: 'spend', to, amountALGO: n });
      return;
    }

    // Withdraw: amount is implied (withdraw all from one selected UTXO).
    if (!algosdk.isValidAddress(to)) {
      Alert.alert('Invalid address', 'Recipient must be a valid Algorand address');
      return;
    }
    onConfirm({ action: 'withdraw', to, amountALGO: 0 });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{action === 'spend' ? 'Send from shielded address' : 'Withdraw to public address'}</Text>
          <Text style={styles.modalSubtitle}>Current balance: {formatBalance(balance)} ALGO</Text>
          {action === 'withdraw' ? (
            <Text style={[styles.modalSubtitle, { marginTop: -8, opacity: 0.9 }]}>
              Withdraw consumes the largest available note and sends the entire note minus network/proof fees.
            </Text>
          ) : null}

          <View style={styles.segmentedRow}>
            <Pressable
              style={[
                styles.segmentedButton,
                action === 'spend' ? styles.segmentedButtonActive : styles.segmentedButtonInactive,
              ]}
              onPress={() => setAction('spend')}
            >
              <Text style={action === 'spend' ? styles.segmentedTextActive : styles.segmentedTextInactive}>Spend</Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentedButton,
                action === 'withdraw' ? styles.segmentedButtonActive : styles.segmentedButtonInactive,
                !hasUnspentUtxo ? { opacity: 0.5 } : null,
              ]}
              onPress={() => setAction('withdraw')}
              disabled={!hasUnspentUtxo}
            >
              <Text style={action === 'withdraw' ? styles.segmentedTextActive : styles.segmentedTextInactive}>Withdraw</Text>
            </Pressable>
          </View>

          {action === 'spend' ? (
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Amount (ALGO)"
              placeholderTextColor="#C9B8FF"
              value={amount}
              onChangeText={setAmount}
            />
          ) : null}
          <TextInput
            style={styles.modalInput}
            placeholder={action === 'spend' ? 'Recipient shielded address (mith...)' : 'Recipient Algorand address'}
            placeholderTextColor="#C9B8FF"
            value={toAddress}
            onChangeText={setToAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.modalButtonsRow}>
            <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirm}>
              <Text style={styles.modalButtonText}>{action === 'spend' ? 'Send' : 'Make Public'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  utxoToggle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  utxoToggleText: {
    color: '#EDE7FF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: -1,
  },
  utxoList: {
    width: '100%',
    maxWidth: 420,
    marginTop: -6,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  utxoRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  utxoRowText: {
    color: '#C9B8FF',
    fontSize: 13,
    fontWeight: '600',
  },
  utxoRowSubText: {
    color: '#EDE7FF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
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
  segmentedRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentedButtonActive: {
    backgroundColor: 'rgba(201,184,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(201,184,255,0.35)',
  },
  segmentedButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentedTextActive: {
    color: '#EDE7FF',
    fontWeight: '800',
  },
  segmentedTextInactive: {
    color: '#C9B8FF',
    fontWeight: '700',
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
