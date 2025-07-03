import storage from 'node-persist';

export const STORAGE_KEY_SUFFIX_BRIGHTNESS = 'Brightness';
export const STORAGE_KEY_SUFFIX_ON = 'On';
export const STORAGE_KEY_SUFFIX_LOCK_STATE = 'LockState';

async function init(dir: string) {
  await storage.init({ dir: dir, forgiveParseErrors: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageGet(dir: string, key: string): Promise<any> {
  try {
    await init(dir);
    return await storage.get(key);
  } catch (err) {
    // Nothing
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageSet(dir: string, key: string, value: any): Promise<void> {
  try {
    await init(dir);
    storage.set(key, value);
  } catch {
    // Nothing
  }
}
