import { AppRegistry } from 'react-native';
import App from './src/App.web';

// Register the app for web
AppRegistry.registerComponent('BuddyMate', () => App);

// Run the app
AppRegistry.runApplication('BuddyMate', {
  rootTag: document.getElementById('mobile-container'),
});