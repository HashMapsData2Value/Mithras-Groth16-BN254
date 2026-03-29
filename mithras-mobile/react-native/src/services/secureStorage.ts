// Used to store sensitive data like mnemonic.

import * as Keychain from 'react-native-keychain';

const SERVICE = 'mithras_mnemonic';

function formatUnknownError(err: unknown): string {
  if (err instanceof Error) {
    const extra: Record<string, unknown> = err as any;
    const maybeCode = extra.code ?? extra.status ?? extra.osStatus;
    const maybeDomain = extra.domain;
    const parts = [err.name, err.message].filter(Boolean).join(': ');
    const details = [
      maybeCode !== undefined ? `code=${String(maybeCode)}` : null,
      maybeDomain !== undefined ? `domain=${String(maybeDomain)}` : null,
    ]
      .filter(Boolean)
      .join(' ');
    return details ? `${parts} (${details})` : parts;
  }
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function setMnemonic(mnemonic: string): Promise<void> {
  const setGenericPassword = (Keychain as any).setGenericPassword as
    | undefined
    | ((username: string, password: string, options?: any) => Promise<boolean | unknown>);
  if (typeof setGenericPassword !== 'function') {
    throw new Error(
      `Keychain module missing setGenericPassword (bridgeless/new-arch interop issue?) service=${SERVICE}`,
    );
  }

  const attempts: Array<{ label: string; options: any }> = [
    {
      label: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
      options: {
        service: SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    },
    {
      label: 'WHEN_UNLOCKED',
      options: {
        service: SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    },
    {
      label: 'DEFAULT',
      options: {
        service: SERVICE,
      },
    },
  ];

  const failures: string[] = [];
  for (const attempt of attempts) {
    try {
      const result = await setGenericPassword('mnemonic', mnemonic, attempt.options as any);
      if (result === false) {
        failures.push(`${attempt.label}: returned false`);
        continue;
      }
      return;
    } catch (err) {
      failures.push(`${attempt.label}: ${formatUnknownError(err)}`);
    }
  }

  throw new Error(`Failed to store mnemonic in Keychain (service=${SERVICE}). Attempts: ${failures.join(' | ')}`);
}

export async function getMnemonic(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE } as any);
    if (creds) return creds.password;
    return null;
  } catch (e) {
    if (__DEV__) {
      console.warn('Keychain getMnemonic failed', formatUnknownError(e));
    }
    return null;
  }
}

export async function hasMnemonic(): Promise<boolean> {
  const m = await getMnemonic();
  return !!m;
}