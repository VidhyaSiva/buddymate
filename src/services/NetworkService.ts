// Mock NetInfo for testing environment
let NetInfo: any;

try {
  NetInfo = require('@react-native-community/netinfo');
} catch (error) {
  // Mock implementation for testing
  NetInfo = {
    addEventListener: (callback: any) => {
      // Mock network state
      setTimeout(() => {
        callback({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {}
        });
      }, 100);
      return () => {}; // Unsubscribe function
    },
    fetch: async () => ({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {}
    })
  };
}
import { EventEmitter } from 'events';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export class NetworkService extends EventEmitter {
  private static instance: NetworkService;
  private currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: null,
    type: 'unknown',
    details: null
  };

  private constructor() {
    super();
    this.initialize();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private initialize(): void {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details
      };

      const wasConnected = this.currentState.isConnected;
      const isNowConnected = newState.isConnected;

      this.currentState = newState;

      // Emit events for state changes
      this.emit('networkStateChange', newState);

      if (!wasConnected && isNowConnected) {
        this.emit('connectionRestored', newState);
      } else if (wasConnected && !isNowConnected) {
        this.emit('connectionLost', newState);
      }
    });
  }

  public getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  public isConnected(): boolean {
    return this.currentState.isConnected;
  }

  public isInternetReachable(): boolean {
    return this.currentState.isInternetReachable === true;
  }

  public async checkConnectivity(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details
    };
  }
}

export default NetworkService.getInstance();