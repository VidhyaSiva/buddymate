import CryptoJS from 'crypto-js';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Enhanced Encryption Service for end-to-end encryption of personal health data
 */
export class EncryptionService {
  private readonly ALGORITHM = 'AES';
  private readonly KEY_SIZE = 256;
  private readonly IV_SIZE = 16;
  private readonly SALT_SIZE = 16;

  /**
   * Generate a secure encryption key from password and salt
   */
  private deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: 10000
    }).toString();
  }

  /**
   * Generate a random salt
   */
  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(this.SALT_SIZE).toString();
  }

  /**
   * Generate a random initialization vector
   */
  private generateIV(): string {
    return CryptoJS.lib.WordArray.random(this.IV_SIZE).toString();
  }

  /**
   * Encrypt data using AES encryption with PBKDF2 key derivation
   */
  async encryptData(data: string, password: string): Promise<EncryptionResult> {
    try {
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = this.deriveKey(password, salt);

      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encryptedData: encrypted.toString(),
        iv,
        salt
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  async decryptData(
    encryptedData: string,
    password: string,
    iv: string,
    salt: string
  ): Promise<DecryptionResult> {
    try {
      const key = this.deriveKey(password, salt);

      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        return {
          success: false,
          error: 'Decryption failed - invalid password or corrupted data'
        };
      }

      return {
        success: true,
        data: decryptedString
      };
    } catch (error) {
      return {
        success: false,
        error: `Decryption failed: ${error}`
      };
    }
  }

  /**
   * Encrypt health data with additional metadata
   */
  async encryptHealthData(healthData: any, userPassword: string): Promise<string> {
    try {
      const dataWithMetadata = {
        data: healthData,
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'health_data'
      };

      const jsonString = JSON.stringify(dataWithMetadata);
      const encryptionResult = await this.encryptData(jsonString, userPassword);

      // Combine all encryption components into a single string
      const combinedData = {
        encrypted: encryptionResult.encryptedData,
        iv: encryptionResult.iv,
        salt: encryptionResult.salt,
        algorithm: this.ALGORITHM,
        keySize: this.KEY_SIZE
      };

      return JSON.stringify(combinedData);
    } catch (error) {
      throw new Error(`Health data encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt health data and validate metadata
   */
  async decryptHealthData(encryptedHealthData: string, userPassword: string): Promise<any> {
    try {
      const combinedData = JSON.parse(encryptedHealthData);
      
      if (!combinedData.encrypted || !combinedData.iv || !combinedData.salt) {
        throw new Error('Invalid encrypted data format');
      }

      const decryptionResult = await this.decryptData(
        combinedData.encrypted,
        userPassword,
        combinedData.iv,
        combinedData.salt
      );

      if (!decryptionResult.success) {
        throw new Error(decryptionResult.error || 'Decryption failed');
      }

      const dataWithMetadata = JSON.parse(decryptionResult.data!);
      
      // Validate metadata
      if (dataWithMetadata.type !== 'health_data') {
        throw new Error('Invalid data type');
      }

      return dataWithMetadata.data;
    } catch (error) {
      throw new Error(`Health data decryption failed: ${error}`);
    }
  }

  /**
   * Generate a secure hash for data integrity verification
   */
  generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Verify data integrity using hash
   */
  verifyHash(data: string, expectedHash: string): boolean {
    const actualHash = this.generateHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Encrypt communication data for family sharing
   */
  async encryptCommunicationData(communicationData: any, recipientPublicKey: string): Promise<string> {
    try {
      // In a real implementation, this would use RSA or similar asymmetric encryption
      // For this demo, we'll use symmetric encryption with a shared key
      const sharedKey = this.generateSecurePassword(32);
      
      const dataWithMetadata = {
        data: communicationData,
        timestamp: new Date().toISOString(),
        type: 'communication_data',
        recipient: recipientPublicKey
      };

      const jsonString = JSON.stringify(dataWithMetadata);
      return await this.encryptData(jsonString, sharedKey).then(result => 
        JSON.stringify({ ...result, sharedKey })
      );
    } catch (error) {
      throw new Error(`Communication data encryption failed: ${error}`);
    }
  }

  /**
   * Create encrypted backup of all user data
   */
  async createEncryptedBackup(userData: any, backupPassword: string): Promise<string> {
    try {
      const backupData = {
        data: userData,
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'full_backup',
        checksum: this.generateHash(JSON.stringify(userData))
      };

      const jsonString = JSON.stringify(backupData);
      const encryptionResult = await this.encryptData(jsonString, backupPassword);

      return JSON.stringify({
        ...encryptionResult,
        backupVersion: '1.0',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Backup encryption failed: ${error}`);
    }
  }

  /**
   * Restore data from encrypted backup
   */
  async restoreFromEncryptedBackup(encryptedBackup: string, backupPassword: string): Promise<any> {
    try {
      const backupInfo = JSON.parse(encryptedBackup);
      
      const decryptionResult = await this.decryptData(
        backupInfo.encryptedData,
        backupPassword,
        backupInfo.iv,
        backupInfo.salt
      );

      if (!decryptionResult.success) {
        throw new Error(decryptionResult.error || 'Backup decryption failed');
      }

      const backupData = JSON.parse(decryptionResult.data!);
      
      // Verify backup integrity
      const expectedChecksum = backupData.checksum;
      const actualChecksum = this.generateHash(JSON.stringify(backupData.data));
      
      if (expectedChecksum !== actualChecksum) {
        throw new Error('Backup data integrity check failed');
      }

      return backupData.data;
    } catch (error) {
      throw new Error(`Backup restoration failed: ${error}`);
    }
  }

  /**
   * Securely wipe sensitive data from memory (best effort)
   */
  secureWipe(sensitiveString: string): void {
    // In JavaScript, we can't truly wipe memory, but we can overwrite the string
    // This is more of a symbolic gesture for security awareness
    if (typeof sensitiveString === 'string') {
      // Overwrite with random data (limited effectiveness in JS)
      for (let i = 0; i < sensitiveString.length; i++) {
        sensitiveString = sensitiveString.substring(0, i) + 
                         String.fromCharCode(Math.floor(Math.random() * 256)) + 
                         sensitiveString.substring(i + 1);
      }
    }
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();