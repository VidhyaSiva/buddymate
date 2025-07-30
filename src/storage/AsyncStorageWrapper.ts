import CryptoJS from 'crypto-js';
import AsyncStorage from '../utils/AsyncStoragePlatform';

/**
 * AsyncStorage wrapper with encryption for sensitive data
 * Uses platform-specific AsyncStorage (React Native or web polyfill)
 */
export class AsyncStorageWrapper {
    private encryptionKey: string;

    constructor(encryptionKey?: string) {
        this.encryptionKey = encryptionKey || 'buddy-mate-default-key-2024';
    }

    /**
     * Store data with optional encryption
     */
    async setItem(key: string, value: string, encrypt: boolean = false): Promise<void> {
        try {
            console.log(`AsyncStorageWrapper: Setting item ${key}, encrypt: ${encrypt}`);
            const dataToStore = encrypt ? this.encrypt(value) : value;
            await AsyncStorage.setItem(key, dataToStore);
            console.log(`AsyncStorageWrapper: Successfully stored item ${key}`);
        } catch (error) {
            console.error(`AsyncStorageWrapper: Failed to store item ${key}:`, error);
            throw new Error(`Failed to store item with key ${key}: ${error}`);
        }
    }

    /**
     * Retrieve data with optional decryption
     */
    async getItem(key: string, decrypt: boolean = false): Promise<string | null> {
        try {
            console.log(`AsyncStorageWrapper: Getting item ${key}, decrypt: ${decrypt}`);
            const storedData = await AsyncStorage.getItem(key);
            console.log(`AsyncStorageWrapper: Raw stored data for ${key}:`, storedData ? 'exists' : 'null');
            if (!storedData) return null;

            const result = decrypt ? this.decrypt(storedData) : storedData;
            console.log(`AsyncStorageWrapper: Returning data for ${key}:`, result ? 'exists' : 'null');
            return result;
        } catch (error) {
            console.error(`AsyncStorageWrapper: Failed to retrieve item ${key}:`, error);
            throw new Error(`Failed to retrieve item with key ${key}: ${error}`);
        }
    }

    /**
     * Remove item from storage
     */
    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            throw new Error(`Failed to remove item with key ${key}: ${error}`);
        }
    }

    /**
     * Clear all storage
     */
    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            throw new Error(`Failed to clear storage: ${error}`);
        }
    }

    /**
     * Get all keys
     */
    async getAllKeys(): Promise<string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            throw new Error(`Failed to get all keys: ${error}`);
        }
    }

    /**
     * Check if key exists
     */
    async hasKey(key: string): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value !== null;
        } catch (error) {
            throw new Error(`Failed to check key existence: ${error}`);
        }
    }

    /**
     * Encrypt sensitive data
     */
    private encrypt(data: string): string {
        try {
            return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
        } catch (error) {
            throw new Error(`Encryption failed: ${error}`);
        }
    }

    /**
     * Decrypt sensitive data
     */
    private decrypt(encryptedData: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) {
                throw new Error('Decryption resulted in empty data');
            }

            return decryptedData;
        } catch (error) {
            throw new Error(`Decryption failed: ${error}`);
        }
    }

    /**
     * Store JSON data with optional encryption
     */
    async setJSON<T>(key: string, value: T, encrypt: boolean = false): Promise<void> {
        const jsonString = JSON.stringify(value);
        await this.setItem(key, jsonString, encrypt);
    }

    /**
     * Retrieve JSON data with optional decryption
     */
    async getJSON<T>(key: string, decrypt: boolean = false): Promise<T | null> {
        const jsonString = await this.getItem(key, decrypt);
        if (!jsonString) return null;

        try {
            return JSON.parse(jsonString) as T;
        } catch (error) {
            throw new Error(`Failed to parse JSON for key ${key}: ${error}`);
        }
    }
}

// Singleton instance
export const asyncStorage = new AsyncStorageWrapper();