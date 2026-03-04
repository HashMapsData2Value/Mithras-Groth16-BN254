import { Platform } from 'react-native';
import { Buffer } from '@craftzdog/react-native-buffer';
import {
  DocumentDirectoryPath,
  MainBundlePath,
  exists,
  unlink,
  copyFileAssets,
  copyFile,
} from '@dr.pogodin/react-native-fs';

export async function loadAssets(fileName: string, options?: { force?: boolean }): Promise<string> {
  const filePath = `${DocumentDirectoryPath}/${fileName}`;
  const force = options?.force === true;
  const fileExists = await exists(filePath);

  if (force && fileExists) {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting cached file:', error);
    }
  }

  if (force || !fileExists) {
    try {
      let sourcePath = '';

      if (Platform.OS === 'android') {
        // Android: depending on how/when assets were linked, they may appear under
        // different roots inside the APK. Try a few common locations.
        const candidates = [
          `assets/keys/${fileName}`,
          `custom/${fileName}`,
          `keys/${fileName}`,
          fileName,
        ];

        let lastError: unknown = undefined;
        const attempted: Array<{ path: string; reason?: string }> = [];

        for (const candidate of candidates) {
          try {
            sourcePath = candidate;
            attempted.push({ path: candidate });
            await copyFileAssets(candidate, filePath);
            lastError = undefined;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (lastError) {
          const attempts = attempted.map((a) => `- ${a.path}`).join('\n');
          const message =
            `Unable to locate bundled asset '${fileName}' in Android APK assets. Tried:\n${attempts}`;
          const wrapped = new Error(message);
          (wrapped as any).cause = lastError;
          throw wrapped;
        }
      } else {
        // iOS: depending on how the asset was added to the Xcode project, it may end up
        // either at the bundle root (flattened) or inside an `assets/keys/` subfolder.
        // We'll probe a small set of likely locations.
        const candidates = [
          `${MainBundlePath}/${fileName}`,
          `${MainBundlePath}/assets/keys/${fileName}`,
          `${MainBundlePath}/assets/${fileName}`,
          `${MainBundlePath}/keys/${fileName}`,
          `${MainBundlePath}/custom/${fileName}`,
          `${MainBundlePath}/assets_keys/${fileName}`,
        ];

        let copied = false;
        let lastError: unknown = undefined;
        const attempted: Array<{ path: string; reason?: string }> = [];

        for (const candidate of candidates) {
          try {
            sourcePath = candidate;
            attempted.push({ path: candidate });
            // Don't rely on `exists()` for bundle resources; just attempt the copy.
            await copyFile(candidate, filePath);
            copied = true;

            // Populate sync cache with Buffer for readFileSync consumers
            try {
              const base64 = await (await import('@dr.pogodin/react-native-fs')).readFile(filePath, 'base64');
              const g = globalThis as any;
              g.__RNFS_SYNC_CACHE = g.__RNFS_SYNC_CACHE || {};
              g.__RNFS_SYNC_CACHE[filePath] = Buffer.from(base64, 'base64');
            } catch (err) {
              // non-fatal: caching is optional
              console.warn('Could not populate sync cache for', filePath, err);
            }

            lastError = undefined;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        // Verify the destination exists; if copy silently failed, surface it here.
        const destExists = await exists(filePath);
        if (!copied || !destExists) {
          const attempts = attempted.map((a) => `- ${a.path}`).join('\n');
          const message =
            `Unable to locate/copy bundled asset '${fileName}' on iOS. Tried:\n${attempts}`;
          const wrapped = new Error(message);
          (wrapped as any).cause = lastError;
          throw wrapped;
        }
      }
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  return filePath;
}
