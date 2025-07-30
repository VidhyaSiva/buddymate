import { AsyncStorageWrapper, asyncStorage } from '../storage/AsyncStorageWrapper';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  fallbackToPin?: boolean;
}

export interface PinAuthResult {
  success: boolean;
  error?: string;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  authMethod: 'biometric' | 'pin' | 'none';
  lastAuthTime?: Date;
}

/**
 * Authentication Service providing biometric and PIN authentication
 * Simulates React Native biometric authentication for development/testing
 */
export class AuthenticationService {
  private static instance: AuthenticationService;
  private storage: AsyncStorageWrapper;
  private readonly PIN_KEY = 'user_pin';
  private readonly AUTH_STATE_KEY = 'auth_state';
  private readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private readonly AUTH_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  private constructor(storage: AsyncStorageWrapper = asyncStorage) {
    this.storage = storage;
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Initialize the authentication service
   */
  async initialize(): Promise<void> {
    // Initialize authentication state
    console.log('AuthenticationService initialized');
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<boolean> {
    // In a real React Native app, this would use react-native-biometrics
    // For development/testing, we simulate availability
    return true;
  }

  /**
   * Check if biometric authentication is enabled by user
   */
  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await this.storage.getItem(this.BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  }

  /**
   * Enable or disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.storage.setItem(this.BIOMETRIC_ENABLED_KEY, enabled.toString());
  }

  /**
   * Authenticate using biometric (fingerprint, face, etc.)
   */
  async authenticateWithBiometric(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      const isEnabled = await this.isBiometricEnabled();

      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
          fallbackToPin: true
        };
      }

      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric authentication is not enabled',
          fallbackToPin: true
        };
      }

      // In a real app, this would prompt for biometric authentication
      // For development/testing, we simulate success
      const simulatedSuccess = Math.random() > 0.1; // 90% success rate

      if (simulatedSuccess) {
        await this.setAuthenticationState({
          isAuthenticated: true,
          authMethod: 'biometric',
          lastAuthTime: new Date()
        });

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed',
          fallbackToPin: true
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Biometric authentication error: ${error}`,
        fallbackToPin: true
      };
    }
  }

  /**
   * Set up PIN for authentication
   */
  async setupPin(pin: string): Promise<boolean> {
    try {
      if (!this.isValidPin(pin)) {
        throw new Error('PIN must be 4-6 digits');
      }

      // Hash the PIN before storing (simple hash for demo)
      const hashedPin = this.hashPin(pin);
      await this.storage.setItem(this.PIN_KEY, hashedPin, true);
      return true;
    } catch (error) {
      console.error('Failed to setup PIN:', error);
      return false;
    }
  }

  /**
   * Authenticate using PIN
   */
  async authenticateWithPin(pin: string): Promise<PinAuthResult> {
    try {
      if (!this.isValidPin(pin)) {
        return {
          success: false,
          error: 'Invalid PIN format'
        };
      }

      const storedHashedPin = await this.storage.getItem(this.PIN_KEY, true);
      if (!storedHashedPin) {
        return {
          success: false,
          error: 'No PIN set up'
        };
      }

      const hashedPin = this.hashPin(pin);
      if (hashedPin === storedHashedPin) {
        await this.setAuthenticationState({
          isAuthenticated: true,
          authMethod: 'pin',
          lastAuthTime: new Date()
        });

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect PIN'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `PIN authentication error: ${error}`
      };
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const authState = await this.getAuthenticationState();
      if (!authState.isAuthenticated) {
        return false;
      }

      // Check if authentication has expired
      if (authState.lastAuthTime) {
        const now = new Date().getTime();
        const lastAuth = new Date(authState.lastAuthTime).getTime();
        if (now - lastAuth > this.AUTH_TIMEOUT) {
          await this.logout();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking authentication state:', error);
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  async getAuthenticationState(): Promise<AuthenticationState> {
    try {
      const state = await this.storage.getJSON<AuthenticationState>(this.AUTH_STATE_KEY);
      return state || {
        isAuthenticated: false,
        authMethod: 'none'
      };
    } catch (error) {
      console.error('Error getting authentication state:', error);
      return {
        isAuthenticated: false,
        authMethod: 'none'
      };
    }
  }

  /**
   * Set authentication state
   */
  private async setAuthenticationState(state: AuthenticationState): Promise<void> {
    await this.storage.setJSON(this.AUTH_STATE_KEY, state);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.setAuthenticationState({
      isAuthenticated: false,
      authMethod: 'none'
    });
  }

  /**
   * Check if PIN is set up
   */
  async isPinSetup(): Promise<boolean> {
    const pin = await this.storage.getItem(this.PIN_KEY, true);
    return pin !== null;
  }

  /**
   * Change existing PIN
   */
  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      // Verify old PIN first
      const oldPinResult = await this.authenticateWithPin(oldPin);
      if (!oldPinResult.success) {
        return false;
      }

      // Set new PIN
      return await this.setupPin(newPin);
    } catch (error) {
      console.error('Failed to change PIN:', error);
      return false;
    }
  }

  /**
   * Remove PIN (for testing purposes)
   */
  async removePin(): Promise<void> {
    await this.storage.removeItem(this.PIN_KEY);
  }

  /**
   * Validate PIN format
   */
  private isValidPin(pin: string): boolean {
    return /^\d{4,6}$/.test(pin);
  }

  /**
   * Simple PIN hashing (in production, use proper hashing like bcrypt)
   */
  private hashPin(pin: string): string {
    // Simple hash for demo - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Extend authentication session
   */
  async extendSession(): Promise<void> {
    const authState = await this.getAuthenticationState();
    if (authState.isAuthenticated) {
      await this.setAuthenticationState({
        ...authState,
        lastAuthTime: new Date()
      });
    }
  }
}

// Singleton instance
export const authenticationService = new AuthenticationService();