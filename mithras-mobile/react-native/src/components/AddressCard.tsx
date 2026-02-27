import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Modal, TextInput, Button } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { truncAddress } from '../services/hdwallet';

type Props = {
  address: string;
  balance?: number | string;
};

export default function AddressCard({ address, balance }: Props) {
  const [copied, setCopied] = React.useState(false);
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');

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
    // quick tap opens deposit modal
    setDepositAmount('');
    setDepositOpen(true);
  };

  const formatBalance = (b?: number | string) => {
    if (b === undefined || b === null) return '-';
    const n = typeof b === 'string' ? Number(b) : b;
    if (!isFinite(n)) return '-';
    const algo = n / 1_000_000;
    return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
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
          <Text style={styles.balance}>{formatBalance(balance)} ALGO</Text>
        </View>
      </Pressable>

      <AddressCardModal
        visible={depositOpen}
        onClose={() => setDepositOpen(false)}
        onConfirm={({ action, amountALGO, to }) => {
          const micro = Math.round(amountALGO * 1_000_000);
          if (action === 'deposit') {
            console.log(`Deposit request: address=${address} amountALGO=${amountALGO} micro=${micro}`);
            Alert.alert('Deposit', `Depositing ${amountALGO} ALGO (${micro} µA) to shielded pool.`);
          } else {
            console.log(`Transfer request: from=${address} to=${to} amountALGO=${amountALGO} micro=${micro}`);
            Alert.alert('Transfer', `Transferring ${amountALGO} ALGO (${micro} µA) to ${to}`);
          }
          setDepositOpen(false);
        }}
        balance={balance}
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
  onConfirm,
  balance,
  amount,
  setAmount,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: { action: 'deposit' | 'transfer'; amountALGO: number; to?: string }) => void;
  balance?: number | string;
  amount: string;
  setAmount: (s: string) => void;
}) {
  const [action, setAction] = React.useState<'deposit' | 'transfer' | null>(null);
  const [toAddress, setToAddress] = React.useState('');

  const formatBalance = (b?: number | string) => {
    if (b === undefined || b === null) return '-';
    const n = typeof b === 'string' ? Number(b) : b;
    if (!isFinite(n)) return '-';
    const algo = n / 1_000_000;
    return algo.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const computeMaxString = () => {
    const raw = typeof balance === 'string' ? Number(balance) : balance;
    if (!isFinite(raw)) return '';
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
    onConfirm({ action: action ?? 'deposit', amountALGO: n, to: action === 'transfer' ? toAddress : undefined });
  };

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
