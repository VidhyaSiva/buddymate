/**
 * Platform-specific AsyncStorage import
 * Uses web polyfill for web builds and React Native AsyncStorage for mobile
 */

// For web builds, always use the web polyfill
import AsyncStorageWeb from './AsyncStorageWeb';

export default AsyncStorageWeb;