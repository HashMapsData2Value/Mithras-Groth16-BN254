// Used to store sensitive data like mnemonic.

import * as Keychain from 'react-native-keychain';

const SERVICE = 'mithras_mnemonic';

export async function setMnemonic(mnemonic: string): Promise<void> {
  await Keychain.setGenericPassword('mnemonic', mnemonic, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  } as any);
}

export async function getMnemonic(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE } as any);
    if (creds) return creds.password;
    return null;
  } catch (e) {
    return null;
  }
}

export async function hasMnemonic(): Promise<boolean> {
  const m = await getMnemonic();
  return !!m;
}