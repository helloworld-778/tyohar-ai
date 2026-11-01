/**
 * @file useEventPlan.ts
 * @description Custom React hook managing celebration plan state, undo/redo history,
 * preset baseline resets, and persistent draft synchronization to localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import type { EventPlan } from '../types/tyohar';
import { PRESET_WEDDING, ALL_PRESETS } from '../data/presets';
import { STORAGE_KEYS } from '../constants/config';

interface UseEventPlanOptions {
  onNotify?: (message: string) => void;
}

export function useEventPlan(options: UseEventPlanOptions = {}) {
  const { onNotify } = options;

  // Load draft from localStorage with deterministic fallback to PRESET_WEDDING
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_DRAFT);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.name &&
            typeof parsed.totalBudgetINR === 'number' &&
            Array.isArray(parsed.budgetCategories)
          ) {
            return parsed;
          }
        }
      }
    } catch {
      // Storage disabled or quota exceeded
    }
    return PRESET_WEDDING;
  });

  const [planHistory, setPlanHistory] = useState<EventPlan[]>([]);
  const [isAutosaved, setIsAutosaved] = useState(true);

  // Autosave to localStorage on every change to currentPlan
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_DRAFT, JSON.stringify(currentPlan));
        setIsAutosaved(true);
      }
    } catch {
      // Silently catch quota or disabled storage
    }
  }, [currentPlan]);

  // Discrete mutation with undo history support (max 10 steps)
  const updatePlanWithHistory = useCallback(
    (newPlan: EventPlan) => {
      setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
      setCurrentPlan(newPlan);
    },
    [currentPlan]
  );

  // Undo handler
  const handleUndo = useCallback(() => {
    if (planHistory.length === 0) return;
    const [previous, ...rest] = planHistory;
    setPlanHistory(rest);
    setCurrentPlan(previous);
    onNotify?.('Reverted to previous plan state');
  }, [planHistory, onNotify]);

  // Preset switcher with undo preservation
  const handleSelectPreset = useCallback(
    (preset: EventPlan) => {
      setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
      setCurrentPlan(JSON.parse(JSON.stringify(preset)));
      onNotify?.(`Switched to ${preset.name}`);
    },
    [currentPlan, onNotify]
  );

  // Reset to default preset
  const handleResetToPresetDefault = useCallback(() => {
    const basePreset = ALL_PRESETS.find((p) => p.eventType === currentPlan.eventType) || PRESET_WEDDING;
    setPlanHistory((prev) => [currentPlan, ...prev.slice(0, 9)]);
    setCurrentPlan(JSON.parse(JSON.stringify(basePreset)));
    onNotify?.(`Reset ${basePreset.name} to fresh preset defaults`);
  }, [currentPlan, onNotify]);

  return {
    currentPlan,
    setCurrentPlan,
    planHistory,
    isAutosaved,
    updatePlanWithHistory,
    handleUndo,
    handleSelectPreset,
    handleResetToPresetDefault,
  };
}

