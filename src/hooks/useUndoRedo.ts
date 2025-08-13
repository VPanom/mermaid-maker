import { useState, useCallback } from 'react';
import { DiagramState } from '@/types';

interface HistoryState {
  past: DiagramState[];
  present: DiagramState;
  future: DiagramState[];
}

export const useUndoRedo = (initialState: DiagramState) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const pushToHistory = useCallback((newState: DiagramState) => {
    setHistory(prevHistory => ({
      past: [...prevHistory.past, prevHistory.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory;
      
      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory;
      
      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);
      
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const reset = useCallback((newState: DiagramState) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
};