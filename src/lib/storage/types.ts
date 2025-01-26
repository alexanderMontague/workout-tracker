export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface StorageOptions {
  namespace?: string;
}

export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "StorageError";
  }
}
