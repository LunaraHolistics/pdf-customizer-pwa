/**
 * useHistoryManager Hook
 * Manages undo/redo history and version snapshots
 */

import { useCallback, useState } from 'react';
import { Layer } from '@/types';

export interface HistorySnapshot {
  id: string;
  timestamp: number;
  label: string;
  layers: Layer[];
}

interface UseHistoryManagerReturn {
  history: HistorySnapshot[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addSnapshot: (layers: Layer[], label: string) => void;
  undo: () => Layer[] | null;
  redo: () => Layer[] | null;
  goToSnapshot: (index: number) => Layer[] | null;
  clearHistory: () => void;
  deleteSnapshot: (index: number) => void;
}

export const useHistoryManager = (initialLayers: Layer[] = []): UseHistoryManagerReturn => {
  const [history, setHistory] = useState<HistorySnapshot[]>([
    {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      label: 'Estado inicial',
      layers: initialLayers,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add snapshot to history
  const addSnapshot = useCallback((layers: Layer[], label: string) => {
    setHistory((prev) => {
      // Remove any redo history after current index
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new snapshot
      newHistory.push({
        id: `snapshot-${Date.now()}`,
        timestamp: Date.now(),
        label,
        layers: JSON.parse(JSON.stringify(layers)), // Deep copy
      });

      return newHistory;
    });

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  // Undo to previous snapshot
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex].layers;
    }
    return null;
  }, [currentIndex, history]);

  // Redo to next snapshot
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex].layers;
    }
    return null;
  }, [currentIndex, history]);

  // Go to specific snapshot
  const goToSnapshot = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
      return history[index].layers;
    }
    return null;
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([history[currentIndex]]);
    setCurrentIndex(0);
  }, [history, currentIndex]);

  // Delete specific snapshot
  const deleteSnapshot = useCallback((index: number) => {
    if (history.length <= 1 || index === currentIndex) return; // Can't delete current or only snapshot

    setHistory((prev) => prev.filter((_, i) => i !== index));
    
    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [history.length, currentIndex]);

  return {
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    addSnapshot,
    undo,
    redo,
    goToSnapshot,
    clearHistory,
    deleteSnapshot,
  };
};
