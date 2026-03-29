import { Platform } from 'react-native';
import { Buffer } from '@craftzdog/react-native-buffer';
import {
  DocumentDirectoryPath,
  MainBundlePath,
  exists,
  stat,
  unlink,
  copyFileAssets,
  copyFile,
  readFile,
  writeFile,
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

            // Some Android setups can produce a zero-byte (or truncated) destination file
            // even though `copyFileAssets` did not throw. Verify the destination before
            // declaring success so we can try alternative asset roots.
            const destExists = await exists(filePath);
            if (!destExists) {
              throw new Error(`copyFileAssets succeeded but destination missing: ${filePath}`);
            }

            const st = await stat(filePath);
            const size = typeof st.size === 'number' ? st.size : Number(st.size);
            if (!Number.isFinite(size) || size <= 0) {
              throw new Error(`Copied asset is empty (size=${String(st.size)}): ${filePath}`);
            }

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
        const attempted: Array<{ path: string; error?: string }> = [];

        for (const candidate of candidates) {
          try {
            sourcePath = candidate;
            attempted.push({ path: candidate });
            // Don't rely on `exists()` for bundle resources; just attempt the copy.
            // Some iOS configurations fail `copyFile` from the app bundle even though the
            // resource exists; in that case we fall back to read+write.
            try {
              await copyFile(candidate, filePath);
              copied = true;
            } catch (copyErr) {
              try {
                const base64 = await readFile(candidate, 'base64');
                await writeFile(filePath, base64, 'base64');
                copied = true;
              } catch {
                throw copyErr;
              }
            }

            // Populate sync cache with Buffer for readFileSync consumers
            try {
              const base64 = await readFile(filePath, 'base64');
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
            attempted[attempted.length - 1].error = String((error as any)?.message ?? error);
          }
        }

        // Verify the destination exists; if a forced refresh fails but an old cached copy exists,
        // fall back to the cached file rather than hard-failing.
        const destExists = await exists(filePath);
        if (!copied) {
          if (destExists) {
            return filePath;
          }

          const attempts = attempted
            .map((a) => `- ${a.path}${a.error ? `\n    ${a.error}` : ''}`)
            .join('\n');
          const message =
            `Unable to locate/copy bundled asset '${fileName}' on iOS.\n` +
            `MainBundlePath=${String(MainBundlePath)}\n` +
            `DocumentDirectoryPath=${String(DocumentDirectoryPath)}\n` +
            `Tried:\n${attempts}`;
          const wrapped = new Error(message);
          (wrapped as any).cause = lastError;
          throw wrapped;
        }

        if (!destExists) {
          const message =
            `Bundled asset copy reported success but destination is missing for '${fileName}'.\n` +
            `Destination=${filePath}`;
          throw new Error(message);
        }
      }
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  return filePath;
}
