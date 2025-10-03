import { PrimitiveTypes } from 'homebridge';
import storage from 'node-persist';

type Primative = string | number | boolean;
type Storable = Primative | Primative[] | { [key: string]: PrimitiveTypes };

const BUCKET_KEY = 'Storage.bucket';

export async function storageGet_Deprecated(key: string): Promise<Storable | undefined> {

  if (!Storage.has(key)) {
    const storable = await storage.get(key);
    if (storable) {
      await Storage.set(key, storable);
    }
  }

  return Storage.get(key);
}

export class Storage {

  private static readonly bucket = new Map<string, Storable>();

  public static async init(persistPath: string) {
    await storage.init({ dir: persistPath, forgiveParseErrors: true });

    const bucketJson = await storage.get(BUCKET_KEY);
    if (bucketJson === undefined) {
      return;
    }

    try {
      const bucketArray = JSON.parse(bucketJson) as [string, Storable][];
      for (const entry of bucketArray) {
        Storage.bucket.set(entry[0], entry[1]);
      }
    } catch {
    // ignore
    }
  }

  public static has(key: string) {
    return Storage.bucket.has(key);
  }

  public static get(key: string): Storable | undefined {
    return Storage.bucket.get(key);
  }

  public static async set(key: string, storable: Storable) {
    Storage.bucket.set(key, storable);

    const bucketArray = Array.from(Storage.bucket.entries());
    const bucketJson = JSON.stringify(bucketArray);
    await storage.set(BUCKET_KEY, bucketJson);
  }
}