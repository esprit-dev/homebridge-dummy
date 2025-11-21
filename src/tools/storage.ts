import { PrimitiveTypes } from 'homebridge';
import storage from 'node-persist';

import { PLATFORM_NAME } from '../homebridge/settings.js';

const STORAGE = new Map<string, Map<string, Storable>>();

type Storable = PrimitiveTypes | PrimitiveTypes[] | { [key: string]: PrimitiveTypes };

export class Storage {

  public static async init(persistPath: string) {
    await storage.init({ dir: persistPath, forgiveParseErrors: true });

    await Storage_Deprecated.init();

    const storageJson = await storage.get(PLATFORM_NAME);
    if (storageJson === undefined) {
      return;
    }

    try {
      const storageArray = JSON.parse(storageJson) as [string, [string, Storable][]][];
      for (const [identifier, itemsArray] of storageArray) {
        const itemsMap = new Map<string, Storable>(itemsArray);
        STORAGE.set(identifier, itemsMap);
      }
    } catch {
    // ignore
    }
  }

  public static copy(): [string, [string, Storable][]][] {
    return Array.from(STORAGE.entries()).map(([key, value]) => {
      const valueArray = Array.from(value.entries());
      return [key, valueArray] as [string, [string, Storable][]];
    });
  }

  public static get(identifier: string, key: string): Storable | undefined {
    return STORAGE.get(identifier)?.get(key);
  }

  public static async set(identifier: string, key: string, item: Storable | undefined) {

    const items = STORAGE.get(identifier) || new Map();

    if (item !== undefined) {
      items.set(key, item);
    } else {
      items.delete(key);
    }

    STORAGE.set(identifier, items);

    const storageArray = Array.from(STORAGE.entries()).map(([key, value]) => {
      return [key, Array.from(value.entries())];
    });

    const storageJson = JSON.stringify(storageArray);
    await storage.set(PLATFORM_NAME, storageJson);
  }
}

/**
 * @deprecated
 */
export async function storageGet_Deprecated(key: string): Promise<Storable | undefined> {
  return Storage_Deprecated.get(key) ?? await storage.get(key);
}

/**
 * @deprecated
 */
export class Storage_Deprecated {

  private static readonly bucket = new Map<string, Storable>();

  /**
   * @deprecated
   */
  static async init() {
    const bucketJson = await storage.get('Storage.bucket');
    if (bucketJson === undefined) {
      return;
    }

    try {
      const bucketArray = JSON.parse(bucketJson) as [string, Storable][];
      for (const entry of bucketArray) {
        Storage_Deprecated.bucket.set(entry[0], entry[1]);
      }
    } catch {
    // ignore
    }
  }

  /**
   * @deprecated
   */
  public static get(key: string): Storable | undefined {
    return Storage_Deprecated.bucket.get(key);
  }
}