import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Auto-detect device type based on window width
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSimulator = () => {
    setIsVisible(!isVisible);
  };

  const setDevice = (type: DeviceType) => {
    setDeviceType(type);
    const container = document.getElementById('mobile-container');
    if (container) {
      container.className = `${type}-container`;
    }
  };

  if (!isVisible) {
    return (
      <View style={styles.container}>
        {children}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleSimulator}
          accessibilityLabel="Toggle device simulator"
        >
          <Text style={styles.toggleButtonText}>📱</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.simulatorPanel}>
        <View style={styles.simulatorHeader}>
          <Text style={styles.simulatorTitle}>Device Simulator</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleSimulator}
            accessibilityLabel="Close device simulator"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.deviceButtons}>
          <TouchableOpacity
            style={[styles.deviceButton, deviceType === 'mobile' && styles.activeDeviceButton]}
            onPress={() => setDevice('mobile')}
            accessibilityLabel="Switch to mobile view"
          >
            <Text style={styles.deviceButtonText}>📱 Mobile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deviceButton, deviceType === 'tablet' && styles.activeDeviceButton]}
            onPress={() => setDevice('tablet')}
            accessibilityLabel="Switch to tablet view"
          >
            <Text style={styles.deviceButtonText}>📱 Tablet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deviceButton, deviceType === 'desktop' && styles.activeDeviceButton]}
            onPress={() => setDevice('desktop')}
            accessibilityLabel="Switch to desktop view"
          >
            <Text style={styles.deviceButtonText}>💻 Desktop</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>
            Current: {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
          </Text>
          <Text style={styles.infoText}>
            Width: {window.innerWidth}px
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButtonText: {
    fontSize: 20,
    color: 'white',
  },
  simulatorPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1001,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  simulatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 12,
    color: '#6c757d',
  },
  deviceButtons: {
    gap: 8,
    marginBottom: 16,
  },
  deviceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeDeviceButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  deviceButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  info: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
}); 