import { StorageAdapter, StorageError, StorageOptions } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
  private namespace: string;

  constructor(options: StorageOptions = {}) {
    this.namespace = options.namespace ? `${options.namespace}:` : "";
  }

  private getNamespacedKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getNamespacedKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      throw new StorageError("Failed to get item from storage", error);
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getNamespacedKey(key), JSON.stringify(value));
    } catch (error) {
      throw new StorageError("Failed to set item in storage", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getNamespacedKey(key));
    } catch (error) {
      throw new StorageError("Failed to remove item from storage", error);
    }
  }

  async clear(): Promise<void> {
    try {
      // Only clear items with our namespace
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.namespace)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      throw new StorageError("Failed to clear storage", error);
    }
  }
}
