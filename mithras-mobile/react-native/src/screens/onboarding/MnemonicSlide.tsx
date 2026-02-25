import React from 'react';
import styles from './OnboardingStyles';
import { setMnemonic } from '../../services/secureStorage';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateMnemonicService, validateMnemonicService } from '../../services/mnemonics';

type MnemonicEntryProps = {
  onSaved: () => void;
  onDone: () => void;
  onConfirmed?: (v: boolean) => void;
  showAppAlert: (
    title: string | undefined,
    message: string,
    primaryText?: string,
    primaryAction?: (() => void) | null,
    secondaryText?: string | null,
    secondaryAction?: (() => void) | null,
    variant?: 'error' | 'ack'
  ) => void;
};

export const MnemonicEntryTopLevel: React.FC<MnemonicEntryProps> = ({ onSaved, onDone, onConfirmed, showAppAlert }) => {
  const [text, setText] = React.useState('');
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [showSaved, setShowSaved] = React.useState(false);

  React.useEffect(() => {
    const ok = validateMnemonicService(text);
    setIsValid(ok);
  }, [text, validateMnemonicService]);

  const onChange = (val: string) => {
    setText(val);
    const ok = validateMnemonicService(val);
    setIsValid(ok);
  };

  const onGenerate = async () => {
    try {
      const m = await generateMnemonicService();
      if (m) {
        setText(m);
        const ok = validateMnemonicService(m);
        setIsValid(ok);
      } else {
        showAppAlert('Error', 'Failed to generate mnemonic', undefined, null, null, null, 'error');
      }
    } catch (e) {
      console.warn('Generate error', e);
      showAppAlert('Error', 'Failed to generate mnemonic', undefined, null, null, null, 'error');
    }
  };

  const confirmSave = async () => {
    try {
      await setMnemonic(text.trim());
      if (onConfirmed) onConfirmed(true);
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
        onSaved();
      }, 900);
    } catch (e) {
      console.warn('Secure storage save failed', e);
      showAppAlert('Error', 'Failed to save mnemonic', undefined, null, null, null, 'error');
    }
  };

  const onSave = async () => {
    if (!isValid) {
      showAppAlert('Invalid', 'Please provide a valid 24-word mnemonic before saving.', undefined, null, null, null, 'error');
      return;
    }
    showAppAlert(
      'Important',
      'Access to your mnemonic is necessary to recover your funds if the app is wiped or your phone is lost. Please write it down on paper and store it securely.',
      'Done',
      () => {
        confirmSave();
      },
      'Return',
      null
    );
  };

  return (
    <View style={styles.actionsColumn}>
      <TextInput
        multiline
        value={text}
        onChangeText={onChange}
        placeholder="Enter or generate a 24-word mnemonic"
        style={[styles.mnemonicInput, isValid === null ? {} : isValid ? styles.inputValid : styles.inputInvalid]}
        placeholderTextColor="#9E8CFF"
      />
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, styles.glassButton, styles.generateButton]}
          onPress={onGenerate}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.glassButtonText}>Generate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.glassButton, styles.saveButton, isValid ? null : styles.glassButtonDisabled]}
          onPress={onSave}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={[styles.glassButtonText, !isValid ? styles.glassButtonTextDisabled : null]}>Save</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showSaved} animationType="fade">
        <View style={styles.savedOverlay} pointerEvents="none">
          <View style={styles.savedBubble}>
            <Text style={styles.savedText}>Mnemonic securely stored.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};
