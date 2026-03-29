import React from 'react';
import { TouchableOpacity, View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { setDefaultNetwork, DefaultNetwork, setCustomNetwork } from '../../blockchain/network';
import styles from './OnboardingStyles';

type NetworkConfigProps = {
  showAppAlert: (
    title: string | undefined,
    message: string,
    primaryText?: string,
    primaryAction?: (() => void) | null,
    secondaryText?: string | null,
    secondaryAction?: (() => void) | null,
    variant?: 'error' | 'ack'
  ) => void;
  onConfirmed: (v: boolean) => void;
  goToMnemonic?: () => void;
  onLayoutModeChange?: (mode: 'center' | 'top') => void;
};

export const NetworkConfig: React.FC<NetworkConfigProps> = ({ showAppAlert, onConfirmed, goToMnemonic, onLayoutModeChange }) => {
  const [isValidating, setIsValidating] = React.useState(false);
  const [selected, setSelected] = React.useState<'mainnet' | 'testnet' | 'localnet' | 'custom' | null>(null);
  const [algodUrl, setAlgodUrl] = React.useState('');
  const [algodToken, setAlgodToken] = React.useState('');
  const [algodPort, setAlgodPort] = React.useState('');
  const [indexerUrl, setIndexerUrl] = React.useState('');
  const [indexerToken, setIndexerToken] = React.useState('');
  const [indexerPort, setIndexerPort] = React.useState('');
  const [mithrasAppId, setMithrasAppId] = React.useState('');

  const Option: React.FC<{ id: 'mainnet' | 'testnet' | 'localnet' | 'custom'; label: string; desc?: string }> = ({ id, label, desc }) => {
    const isSel = selected === id;
    return (
      <TouchableOpacity
        onPress={() => setSelected(id)}
        style={[styles.networkOption, isSel ? styles.networkOptionSelected : null]}
        activeOpacity={0.85}
      >
        <View style={styles.networkOptionRow}>
          <View style={[styles.networkBullet, isSel ? styles.networkBulletSelected : null]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.networkLabel}>{label}</Text>
            {desc ? <Text style={styles.networkDesc}>{desc}</Text> : null}
          </View>
          {isSel ? <Text style={styles.networkCheck}>✓</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const onContinue = async () => {
    try {
      setIsValidating(true);

      const cfg = selected === 'custom'
        ? {
          algodUrl: algodUrl || '',
          algodToken: algodToken || '',
          algodPort: algodPort || '',
          indexerUrl: indexerUrl || '',
          indexerToken: indexerToken || '',
          indexerPort: indexerPort || '',
          mithrasAppId: mithrasAppId || '',
        }
        : undefined;

      // TODO: run real validation; placeholder true for now
      const ok = true; // await validateNetworkConfig(selected || 'mainnet', cfg as any);
      setIsValidating(false);

      if (!ok) {
        setSelected(null);
        onConfirmed(false);
        showAppAlert('Validation Failed', 'Network or Mithras Application ID could not be verified. Please check your settings and try again.', undefined, null, null, null, 'error');
        return;
      }

      if (selected === 'mainnet') {
        await setDefaultNetwork(DefaultNetwork.Mainnet);
      } else if (selected === 'testnet') {
        await setDefaultNetwork(DefaultNetwork.Testnet);
      } else if (selected === 'localnet') {
        await setDefaultNetwork(DefaultNetwork.Localnet);
      } else {
        await setCustomNetwork({
          algodUrl: cfg?.algodUrl || '',
          algodToken: cfg?.algodToken || '',
          algodPort: cfg?.algodPort || '',
          indexerUrl: cfg?.indexerUrl || '',
          indexerToken: cfg?.indexerToken || '',
          indexerPort: cfg?.indexerPort || '',
          mithrasAppId: cfg?.mithrasAppId || '',
        });
      }

      onConfirmed(true);
      if (typeof goToMnemonic === 'function') goToMnemonic();
    } catch (e) {
      setIsValidating(false);
      console.warn('Failed to save/validate network config', e);
      showAppAlert('Error', 'Failed to save or validate network configuration', undefined, null, null, null, 'error');
    }
  };

  React.useEffect(() => {
    if (typeof onLayoutModeChange === 'function') {
      onLayoutModeChange(selected === 'custom' ? 'top' : 'center');
    }
  }, [selected, onLayoutModeChange]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', marginTop: 12, flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1 }}>
          <Option id="mainnet" label="Mainnet" desc="Live network for real value." />
          <Option id="testnet" label="Testnet" desc="Sandbox network for testing." />
          <Option id="localnet" label="Localnet" desc="Localhost network. (For local development)." />
          <Option id="custom" label="Custom" desc="Specify your own node or RPC endpoint." />

          {selected === 'custom' && (
            <View style={{ marginTop: 12 }}>
              <TextInput value={algodUrl} onChangeText={setAlgodUrl} placeholder="Algod URL" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44 }]} />
              <TextInput value={algodToken} onChangeText={setAlgodToken} placeholder="Algod Token (optional)" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
              <TextInput value={algodPort} onChangeText={setAlgodPort} placeholder="Algod Port (optional)" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
              <TextInput value={indexerUrl} onChangeText={setIndexerUrl} placeholder="Indexer URL" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
              <TextInput value={indexerToken} onChangeText={setIndexerToken} placeholder="Indexer Token (optional)" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
              <TextInput value={indexerPort} onChangeText={setIndexerPort} placeholder="Indexer Port (optional)" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
              <TextInput value={mithrasAppId} onChangeText={setMithrasAppId} placeholder="Mithras Application ID" placeholderTextColor="#9E8CFF" style={[styles.mnemonicInput, { minHeight: 44, marginTop: 8 }]} />
            </View>
          )}

          {selected ? (
            <View style={{ marginTop: 14, alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity
                style={[styles.glassButton, selected ? styles.saveButton : null, { minWidth: 160 }]}
                onPress={onContinue}
              >
                <Text style={styles.glassButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {isValidating ? (
            <View style={styles.loadingOverlay} pointerEvents="auto">
              <ActivityIndicator size="large" color="#7C4DFF" />
              <Text style={styles.loadingOverlayText}>Checking network…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NetworkConfig;
