import storage from 'node-persist';

export const STORAGE_KEY_SUFFIX_DEFAULT_STATE = 'DefaultState';
export const STORAGE_KEY_SUFFIX_DEFAULT_BRIGHTNESS = 'Brightness';
export const STORAGE_KEY_SUFFIX_DEFAULT_TEMPERATURE = 'Temperature';
export const STORAGE_KEY_SUFFIX_LIMIT = 'Limit';

export async function initStorage(persistPath: string) {
  await storage.init({ dir: persistPath, forgiveParseErrors: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageGet(key: string): Promise<any> {
  try {
    return await storage.get(key);
  } catch (err) {
    // Nothing
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageSet(key: string, value: any): Promise<void> {
  try {
    storage.set(key, value);
  } catch {
    // Nothing
  }
}