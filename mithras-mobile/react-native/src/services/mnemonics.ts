import { wordlist as englishWordlistExport } from '@scure/bip39/wordlists/english.js';
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from '@scure/bip39';

export function generateMnemonicService(strength = 256): string {
  return generateMnemonic(englishWordlistExport, strength);
}

export function validateMnemonicService(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, englishWordlistExport);
}

export function mnemonicToSeed(mnemonic: string, password?: string): Buffer {
  return Buffer.from(mnemonicToSeedSync(mnemonic, password));
}
