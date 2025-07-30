import { useState, useEffect, useCallback } from 'react';
import { voiceService, VoiceCommand } from '../services/VoiceService';

export interface VoiceCommandHookResult {
  isListening: boolean;
  lastCommand: VoiceCommand | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  error: string | null;
}

export const useVoiceCommands = (
  onCommand?: (command: VoiceCommand) => void
): VoiceCommandHookResult => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      await voiceService.startListening();
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start listening');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await voiceService.stopListening();
      setIsListening(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop listening');
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setError(null);
      await voiceService.speak(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to speak text');
    }
  }, []);

  useEffect(() => {
    // Set up voice recognition result handler
    const handleSpeechResults = (results: string[]) => {
      const command = voiceService.processVoiceCommand(results);
      if (command) {
        setLastCommand(command);
        onCommand?.(command);
      }
    };

    // In a real implementation, this would be set up through the voice service
    // For now, we'll simulate it
    return () => {
      // Cleanup
    };
  }, [onCommand]);

  return {
    isListening,
    lastCommand,
    startListening,
    stopListening,
    speak,
    error,
  };
};