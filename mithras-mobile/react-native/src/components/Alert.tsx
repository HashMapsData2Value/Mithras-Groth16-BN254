import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  primaryText?: string;
  primaryAction?: () => void;
  secondaryText?: string;
  secondaryAction?: () => void;
  showReturn?: boolean;
  onRequestClose?: () => void;
};

const AlertModal: React.FC<Props> = ({
  visible,
  title,
  message,
  primaryText = 'OK',
  primaryAction,
  secondaryText,
  secondaryAction,
  onRequestClose,
}) => {
  const handlePrimary = () => {
    if (primaryAction) primaryAction();
    if (onRequestClose) onRequestClose();
  };

  const handleSecondary = () => {
    if (secondaryAction) secondaryAction();
    if (onRequestClose) onRequestClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={styles.overlay} onPress={onRequestClose}>
        <Pressable style={styles.container} onPress={() => { }}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {secondaryText ? (
              <Pressable style={[styles.button, styles.cancel]} onPress={handleSecondary}>
                <Text style={styles.cancelText}>{secondaryText}</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.button, styles.confirm]} onPress={handlePrimary}>
              <Text style={styles.confirmText}>{primaryText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(46,0,102,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: '#EDE7FF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginLeft: 8,
  },
  cancel: {
    backgroundColor: 'rgba(255,193,7,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.28)',
  },
  cancelText: {
    color: '#FFD54F',
    fontWeight: '800',
  },
  confirm: {
    backgroundColor: 'rgba(0,200,83,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.30)',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default AlertModal;

// Convenience wrappers for common alert variants
export const ErrorAlert: React.FC<Omit<Props, 'primaryText' | 'secondaryText'>> = ({
  visible,
  title,
  message,
  primaryAction,
  onRequestClose,
}) => {
  return (
    <AlertModal
      visible={visible}
      title={title}
      message={message}
      primaryText="Return"
      primaryAction={primaryAction}
      onRequestClose={onRequestClose}
    />
  );
};

export const AckAlert: React.FC<Props> = ({
  visible,
  title,
  message,
  primaryText = 'Done',
  primaryAction,
  secondaryText,
  secondaryAction,
  showReturn,
  onRequestClose,
}) => {
  const resolvedSecondaryText = secondaryText ?? (showReturn ? 'Return' : undefined);
  return (
    <AlertModal
      visible={visible}
      title={title}
      message={message}
      primaryText={primaryText}
      primaryAction={primaryAction}
      secondaryText={resolvedSecondaryText}
      secondaryAction={secondaryAction}
      onRequestClose={onRequestClose}
    />
  );
};
