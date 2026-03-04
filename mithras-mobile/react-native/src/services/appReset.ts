import * as Keychain from 'react-native-keychain';

import { storage } from './storage';

const MNEMONIC_SERVICE = 'mithras_mnemonic';

async function resetGenericPasswordByService(service: string): Promise<void> {
  const reset = (Keychain as any).resetGenericPassword as undefined | ((options?: any) => Promise<boolean>);
  if (typeof reset !== 'function') return;
  await reset({ service } as any);
}

/**
 * Clears all local app state while preserving the mnemonic.
 *
 * - Removes all MMKV keys
 * - Removes all Keychain generic passwords EXCEPT the mnemonic service
 */
export async function wipeLocalDataExceptMnemonic(): Promise<void> {
  try {
    const getAllServices = (Keychain as any).getAllGenericPasswordServices as undefined | (() => Promise<string[]>);
    if (typeof getAllServices === 'function') {
      const services = await getAllServices();
      for (const service of services) {
        if (service === MNEMONIC_SERVICE) continue;
        try {
          await resetGenericPasswordByService(service);
        } catch {
          // best-effort
        }
      }
    } else {
      // Fallback: delete known UTXO services (if we can still read the IDs)
      const rawIds = storage.getString('utxo:ids');
      if (rawIds) {
        try {
          const ids = JSON.parse(rawIds);
          if (Array.isArray(ids)) {
            for (const id of ids) {
              if (typeof id !== 'string') continue;
              try {
                await resetGenericPasswordByService(`mithras_utxo:${id}`);
              } catch {
                // best-effort
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }

  // Clear all non-sensitive cached data (network config, UTXOs metadata, Merkle cache, etc.)
  storage.clearAll();
}
