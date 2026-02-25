import { fromSeed, XHDWalletAPI, KeyContext, BIP32DerivationType } from '@algorandfoundation/xhd-wallet-api';
import { mnemonicToSeed } from './mnemonics';
import { storage } from './storage';
import { base32 } from '@scure/base'
import { sha512_256 } from '@noble/hashes/sha2.js'
import { getAlgorandClient } from '../api/network';

function getSeed(): Buffer {
  const mnemonic = storage.getString('mnemonic');
  if (!mnemonic) {
    throw new Error('No mnemonic found in storage');
  }
  return mnemonicToSeed(mnemonic);
}

function getWallet(): XHDWalletAPI {
  return new XHDWalletAPI();
}

export async function getPublicKey(index: number): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = getSeed();
  const rootKey = fromSeed(seed);
  return wallet.keyGen(rootKey, KeyContext.Address, 0, index)
}

export function encodeAddress(publicKey: Uint8Array): string {
  const hash = sha512_256(publicKey) // 32 bytes
  const checksum = hash.slice(-4) // last 4 bytes
  const addressBytes = new Uint8Array([...publicKey, ...checksum])
  return base32.encode(addressBytes).replace(/=+$/, '').toUpperCase()
}

export async function sign(index: number, txn: Uint8Array): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = getSeed();
  const rootKey = fromSeed(seed);
  return wallet.signAlgoTransaction(rootKey, KeyContext.Address, 0, index, txn);
}

export async function scanAddresses(): Promise<string[]> {
  let address: string
  let index = 0;
  const gapLimit = 20;
  let emptyAddresses = 0;
  const foundAddresses: string[] = [];

  const algorandClient = await getAlgorandClient();

  while (emptyAddresses < gapLimit) {
    address = encodeAddress(await getPublicKey(index));
    let info = algorandClient.client.indexer.lookupAccountByID(address).do();
    let funds = (await info).account.amount;
    if (funds > 0) {
      storage.set(`address:m/44/283'/0'/0/${index}`, address);
      foundAddresses.push(address);
      emptyAddresses = 0; // reset gap counter
    } else {
      emptyAddresses++;
    }
    index++;
  }

  return foundAddresses;
}

